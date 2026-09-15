"""Gemini-backed label extraction and object detection.

This is the active extraction path. One call returns both the transcribed label
and the located regions, which is cheaper and faster than two, and lets the
model use what it read to decide where things are.

The boundary from the build order still holds: this module **extracts only**.
It transcribes what is printed and says where it is. Whether any of it complies
with the Rules is decided elsewhere, by code a human can read and diff.
"""

from __future__ import annotations

import json
import time
from typing import Any

from ..config import settings
from .schemas import EXTRACTION_PROMPT, EXTRACTION_SCHEMA


class GeminiUnavailable(RuntimeError):
    """Raised when Gemini extraction is requested but cannot run."""


def is_configured() -> bool:
    return bool(settings.VLM_API_KEY) and settings.VLM_PROVIDER == "google"


def _client():
    try:
        from google import genai
    except ImportError as exc:
        raise GeminiUnavailable(
            "The Gemini SDK is not installed. Run: pip install google-genai"
        ) from exc

    if not settings.VLM_API_KEY:
        raise GeminiUnavailable(
            "No API key. Set VLM_API_KEY in .env (never in source, never committed)."
        )

    return genai.Client(api_key=settings.VLM_API_KEY)


# Upstream conditions that are worth waiting out rather than failing on. A
# model-overloaded 503 or a rate-limit 429 says "not now", not "never" -- and an
# officer standing in a shop should not lose a capture to either.
_TRANSIENT_MARKERS = (
    "503", "unavailable", "overloaded",
    "429", "rate limit", "resource_exhausted", "quota",
    "500", "internal", "deadline", "timeout",
)


def _is_transient(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(marker in message for marker in _TRANSIENT_MARKERS)


def _generate_with_retry(client: Any, model: str, contents: Any, config: Any) -> Any:
    """Call Gemini, retrying transient upstream failures with backoff."""
    attempts = max(1, settings.GEMINI_MAX_ATTEMPTS)
    last: Exception | None = None

    for attempt in range(attempts):
        try:
            return client.models.generate_content(model=model, contents=contents, config=config)
        except Exception as exc:  # pragma: no cover - depends on the provider
            last = exc
            if not _is_transient(exc) or attempt == attempts - 1:
                break

            delay = settings.GEMINI_RETRY_BASE_S * (2**attempt)
            print(
                f"Gemini transient failure (attempt {attempt + 1}/{attempts}), "
                f"retrying in {delay:.1f}s: {str(exc)[:120]}"
            )
            time.sleep(delay)

    hint = (
        " The model was busy upstream; this usually clears in a few seconds."
        if last and _is_transient(last)
        else ""
    )
    raise GeminiUnavailable(f"Gemini request failed after {attempts} attempt(s): {last}.{hint}")


def _to_pixels(box_2d: list[int], width: int, height: int) -> dict[str, int]:
    """Convert Gemini's 0-1000 [ymin, xmin, ymax, xmax] to a pixel box.

    Values are clamped: a model occasionally returns a coordinate slightly
    outside the range, and a negative crop is harder to debug later than a
    box that simply meets the edge.
    """
    ymin, xmin, ymax, xmax = (max(0, min(1000, int(v))) for v in box_2d[:4])

    x0 = int(xmin / 1000 * width)
    y0 = int(ymin / 1000 * height)
    x1 = int(xmax / 1000 * width)
    y1 = int(ymax / 1000 * height)

    return {
        "x": min(x0, x1),
        "y": min(y0, y1),
        "width": max(abs(x1 - x0), 1),
        "height": max(abs(y1 - y0), 1),
    }


def extract(
    image_bytes: bytes,
    media_type: str = "image/jpeg",
    *,
    image_size: tuple[int, int] | None = None,
    model: str | None = None,
) -> dict[str, Any]:
    """Transcribe the label and locate its regions.

    ``image_size`` is (width, height) of the image the bytes represent, used to
    convert normalised boxes to pixels. Without it, boxes are returned
    normalised only.
    """
    from google.genai import types

    started = time.perf_counter()
    client = _client()
    chosen_model = model or settings.VLM_MODEL or "gemini-2.5-flash"

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_json_schema=EXTRACTION_SCHEMA,
        # Transcription, not composition: the model should read what is printed,
        # not produce an interesting variation on it.
        temperature=0.0,
        # Reading a label needs no deliberation, and thinking tokens dominated
        # latency in testing.
        thinking_config=types.ThinkingConfig(thinking_budget=settings.GEMINI_THINKING_BUDGET),
    )
    contents = [
        types.Part.from_bytes(data=image_bytes, mime_type=media_type),
        EXTRACTION_PROMPT,
    ]

    response = _generate_with_retry(client, chosen_model, contents, config)

    raw = (response.text or "").strip()
    if not raw:
        raise GeminiUnavailable("Gemini returned an empty response.")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise GeminiUnavailable(f"Gemini returned malformed JSON: {exc}") from exc

    # Convert boxes to pixels where the image size is known.
    if image_size:
        width, height = image_size
        for detection in data.get("detections") or []:
            box = detection.get("box_2d")
            if isinstance(box, list) and len(box) >= 4:
                detection["box"] = _to_pixels(box, width, height)

    data["_meta"] = {
        "model": chosen_model,
        "provider": "google",
        "processing_time_ms": int((time.perf_counter() - started) * 1000),
        "usage": _usage(response),
    }
    return data


def _usage(response: Any) -> dict[str, Any] | None:
    """Token counts, so cost per inspection is visible rather than a surprise."""
    meta = getattr(response, "usage_metadata", None)
    if meta is None:
        return None

    return {
        "prompt_tokens": getattr(meta, "prompt_token_count", None),
        "response_tokens": getattr(meta, "candidates_token_count", None),
        "total_tokens": getattr(meta, "total_token_count", None),
    }


def to_declaration_heads(data: dict[str, Any]) -> dict[str, Any]:
    """Map the Gemini response onto the shape the rest of the system stores.

    Keeps the Node Inspection schema unchanged, so switching extraction engines
    does not ripple through the database or the UI.
    """
    manufacturer = data.get("manufacturer") or {}
    quantity = data.get("net_quantity") or {}
    date = data.get("month_year") or {}
    mrp = data.get("mrp") or {}
    care = data.get("consumer_care") or {}
    package = data.get("package") or {}

    return {
        "manufacturer": {
            "name": manufacturer.get("name"),
            "address": manufacturer.get("address"),
            "qualifier": manufacturer.get("qualifier"),
        },
        "genericName": data.get("generic_name"),
        "netQuantity": {
            "value": quantity.get("value"),
            "unit": quantity.get("unit"),
            "raw": quantity.get("raw"),
        },
        "monthYear": {
            "month": date.get("month"),
            "year": date.get("year"),
            "raw": date.get("raw"),
        },
        "mrp": {
            "value": mrp.get("value"),
            "wording": mrp.get("raw"),
            "raw": mrp.get("raw"),
        },
        "consumerCare": {
            "name": care.get("name"),
            "address": care.get("address"),
            "phone": care.get("phone"),
            "email": care.get("email"),
        },
        "additionalInfo": {
            "brandName": data.get("brand_name"),
            "nutrition": data.get("nutrition"),
            "ingredients": data.get("ingredients"),
            "allergens": data.get("allergen_declaration"),
            "fssaiLicence": data.get("fssai_licence_number"),
            "vegNonVeg": data.get("veg_nonveg_mark"),
            "countryOfOrigin": data.get("country_of_origin"),
            "batchNumber": data.get("batch_number"),
            # Rule 9(4) language and Rule 6(3) stickers are decided from these.
            "scriptsPresent": data.get("scripts_present") or [],
            "stickerOverDeclaration": data.get("sticker_over_declaration"),
            "hasWhenPackedQualifier": bool(
                (data.get("net_quantity") or {}).get("has_when_packed_qualifier")
            ),
            "package": package,
            # The package type answers what an officer would otherwise tick by
            # hand, and what Rules 7(2) and 9(1)(b) turn on.
            "isCurvedSurface": package.get("is_curved_surface"),
            "isBlownOrMoulded": package.get("is_blown_or_moulded"),
            "detections": data.get("detections") or [],
            "legibilityIssues": data.get("legibility_issues") or [],
            "otherText": data.get("other_text") or [],
            "extractionConfidence": data.get("confidence"),
            "notes": data.get("notes"),
            "engine": (data.get("_meta") or {}).get("model"),
            "usage": (data.get("_meta") or {}).get("usage"),
        },
    }
