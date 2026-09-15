"""VLM tagging for the two unstructured declaration heads -- build order step 3.

Four of the six heads are statutorily patterned, so regex plus a fuzzy match
gets most of the way, and that tagger lives in the Node extraction service where
the rest of the normalisation happens. Two heads are not patterned:

  * manufacturer name and address, including the 'manufactured by' / 'packed by'
    / 'imported by' attribution that Explanations I and II to Rule 6 turn on --
    which is reading comprehension, not pattern matching;
  * the common or generic name, which has to be told apart from the brand name.

Those go to a VLM with a JSON schema.

Deliberately **not** done here: fine-tuning LayoutLMv3 or LiLT. That is the
textbook answer and the wrong one at this stage -- it needs several hundred
hand-labelled packages before it beats regex. Revisit only if the VLM proves
too slow or costly at volume.

The boundary that matters: this module only ever *extracts*. Once fields are
extracted and confirmed, the rule engine is pure functions over JSON. That
boundary is what makes a verdict defensible.
"""

from __future__ import annotations

import base64
import json
from typing import Any

from ..config import settings

# The schema the model must fill. Every field is nullable: "not on the pack" is
# a legitimate and important answer, and inventing a value would be worse than
# returning nothing.
EXTRACTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "manufacturer": {
            "type": "object",
            "properties": {
                "name": {"type": ["string", "null"]},
                "address": {"type": ["string", "null"]},
                "qualifier": {
                    "type": ["string", "null"],
                    "enum": [
                        "manufactured by",
                        "packed by",
                        "imported by",
                        "marketed by",
                        "manufactured and packed by",
                        None,
                    ],
                    "description": (
                        "The attribution printed before the name. Explanation I to Rule 6: "
                        "a name with no qualifier is presumed to be the manufacturer's. "
                        "Explanation II: a brand owner shown as marketer is liable as deemed "
                        "manufacturer."
                    ),
                },
                "is_first_named": {
                    "type": "boolean",
                    "description": (
                        "True when this is the first name on the panel. Where several names "
                        "appear, prosecution is launched against the one named first."
                    ),
                },
            },
            "required": ["name", "address", "qualifier"],
        },
        "generic_name": {
            "type": ["string", "null"],
            "description": (
                "Rule 6(1)(b): the common or generic name of the commodity, e.g. 'Biscuits', "
                "'Toilet Soap', 'Tea'. NOT the brand name and NOT a marketing descriptor."
            ),
        },
        "brand_name": {
            "type": ["string", "null"],
            "description": "Recorded separately so it is never mistaken for the generic name.",
        },
        "additional_names": {
            "type": "array",
            "items": {"type": "object", "properties": {"name": {"type": "string"}, "qualifier": {"type": "string"}}},
            "description": "Any further names on the panel, in the order they are printed.",
        },
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "notes": {"type": "string"},
    },
    "required": ["manufacturer", "generic_name", "confidence"],
}

PROMPT = """You are reading the label of an Indian pre-packaged commodity to support a \
Legal Metrology (Packaged Commodities) Rules, 2011 inspection.

Extract only two things, exactly as printed:

1. The manufacturer / packer / importer block under Rule 6(1)(a) - the name, the \
complete address, and the qualifier printed before the name ("manufactured by", \
"packed by", "imported by", "marketed by"). The qualifier matters legally: under \
Explanation I to Rule 6 a name with no qualifier is presumed to be the manufacturer's, \
and under Explanation II a brand owner shown as marketer is liable as deemed \
manufacturer. If several names appear, list them in printed order - prosecution is \
launched against the one named first.

2. The common or generic name of the commodity under Rule 6(1)(b) - what the product \
generically IS ("Biscuits", "Toilet Soap", "Refined Sunflower Oil"), not the brand and \
not a marketing line. Record the brand separately.

Rules for your answer:
- Transcribe what is printed. Do not correct, expand or infer.
- If something is not legible or not present, return null. Never guess.
- Do not comment on compliance. You are reading the label, not judging it.

Return JSON matching the provided schema and nothing else.

OCR tokens already read from this image, as a hint (they may contain errors):
{tokens}
"""


class VLMUnavailable(RuntimeError):
    """Raised when tagging is requested but no provider is configured."""


def is_configured() -> bool:
    return bool(settings.VLM_ENABLED and settings.VLM_API_KEY)


def status() -> dict[str, Any]:
    return {
        "enabled": settings.VLM_ENABLED,
        "configured": is_configured(),
        "provider": settings.VLM_PROVIDER,
        "model": settings.VLM_MODEL if is_configured() else None,
        "heads": ["manufacturer", "generic_name"],
        "detail": (
            "Regex handles MRP, net quantity, month/year and consumer care; only the two "
            "unstructured heads are sent to a model."
        ),
    }


def tag(image_bytes: bytes, ocr_tokens: list[str], media_type: str = "image/jpeg") -> dict[str, Any]:
    """Extract the two unstructured heads. Raises VLMUnavailable when unconfigured."""
    if not is_configured():
        raise VLMUnavailable(
            "VLM tagging is not configured. Set VLM_ENABLED=true and ANTHROPIC_API_KEY, "
            "or leave it off and let the regex tagger handle all six heads with the "
            "unstructured two routed to officer review."
        )

    if settings.VLM_PROVIDER != "anthropic":
        raise VLMUnavailable(f"Unsupported VLM provider: {settings.VLM_PROVIDER}")

    import anthropic

    client = anthropic.Anthropic(api_key=settings.VLM_API_KEY, timeout=settings.VLM_TIMEOUT_S)

    message = client.messages.create(
        model=settings.VLM_MODEL,
        max_tokens=1024,
        tools=[
            {
                "name": "record_declarations",
                "description": "Record the two unstructured declaration heads read off the label.",
                "input_schema": EXTRACTION_SCHEMA,
            }
        ],
        tool_choice={"type": "tool", "name": "record_declarations"},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        },
                    },
                    {"type": "text", "text": PROMPT.format(tokens=json.dumps(ocr_tokens[:60]))},
                ],
            }
        ],
    )

    for block in message.content:
        if getattr(block, "type", None) == "tool_use":
            return dict(block.input)

    raise VLMUnavailable("Model returned no structured extraction.")
