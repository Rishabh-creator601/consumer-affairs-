const { OCR_SERVICE_URL } = require('../config/env');
const { analyzeImage, getServiceStatus } = require('./ocrStub');

/**
 * Client for the Python vision sidecar.
 *
 * The sidecar reads and measures; it never decides compliance. What comes back
 * is tokens plus physical measurements with a confidence band on each, and the
 * deterministic rule pack in this service turns those into verdicts. That
 * boundary is what makes a finding reproducible and defensible under challenge.
 */

const VISION_TIMEOUT_MS = Number(process.env.VISION_TIMEOUT_MS || 30000);

const isFetchAvailable = () => typeof fetch === 'function' && typeof FormData !== 'undefined';

async function callVision(path, { file, fields = {}, method = 'POST' } = {}) {
  if (!isFetchAvailable()) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const options = { method, signal: controller.signal };

    if (file) {
      const form = new FormData();
      form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) form.append(key, String(value));
      }
      options.body = form;
    }

    const response = await fetch(`${OCR_SERVICE_URL}${path}`, options);
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`Vision service ${path} returned ${response.status}: ${detail.slice(0, 200)}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn(`Vision service unreachable at ${OCR_SERVICE_URL}${path} (${err.message}).`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Normalises the sidecar's token shape onto the one the Inspection schema stores. */
function normalizeTokens(tokens = []) {
  return tokens
    .map((token) => {
      // The service returns {box:{x,y,width,height}}; the legacy stub returns bbox[].
      const box = token.box
        ? [token.box.x, token.box.y, token.box.x + token.box.width, token.box.y + token.box.height]
        : token.bbox;

      return {
        text: token.text,
        bbox: box || [],
        confidence: typeof token.confidence === 'number' ? token.confidence : 0,
        panel: token.panel || 'principal',
        script: token.script
      };
    })
    .filter((token) => token.text && token.text.trim());
}

/**
 * Full pipeline: quality gate, rectify, calibrate, read, measure.
 *
 * `options.referenceWidthMm` is what turns Rule 7 from a guess into a
 * measurement. Without it the sidecar still reads the label, but every
 * millimetre-dependent check comes back needing review rather than asserting a
 * verdict the photograph cannot support.
 */
async function analyze(file, options = {}) {
  const payload = await callVision('/analyze', {
    file,
    fields: {
      panel: options.panel || 'principal',
      reference_width_mm: options.referenceWidthMm,
      reference_kind: options.referenceKind || 'reference_card',
      is_curved_surface: Boolean(options.isCurvedSurface),
      is_blown_or_moulded: Boolean(options.isBlownOrMoulded),
      languages: (options.languages || ['en']).join(','),
      engine: options.engine
    }
  });

  if (!payload) {
    // Sidecar down: fall back to the local stub so an inspection can still be
    // raised in the field, flagged so nothing is mistaken for a real reading.
    const stub = analyzeImage();
    return {
      tokens: normalizeTokens(stub.tokens),
      engine: 'local-stub',
      source: 'local-stub',
      measurements: emptyMeasurements(
        'Vision service unavailable; no measurements were taken. Every millimetre-based ' +
          'check on this inspection needs officer review.'
      ),
      warnings: ['Vision service unreachable; a local stub reading was substituted.']
    };
  }

  return {
    tokens: normalizeTokens(payload.tokens),
    engine: payload.engine,
    source: 'vision-service',
    imageHash: payload.image_hash,
    processingTimeMs: payload.processing_time_ms,
    measurements: {
      quality: payload.quality,
      calibration: payload.calibration,
      numeral: payload.numeral_metrics,
      contrast: payload.contrast,
      clearSpace: payload.clear_space,
      panelGeometry: payload.panel_geometry,
      quantityRegion: payload.quantity_region
    },
    warnings: payload.warnings || []
  };
}

function emptyMeasurements(reason) {
  const low = { confidence: 'LOW', notes: [reason] };
  return {
    quality: null,
    calibration: { mm_per_px: null, source: 'none', ...low },
    numeral: { median_digit_height_mm: null, ...low },
    contrast: { ratio: null, ...low },
    clearSpace: { satisfied: null, ...low },
    panelGeometry: { area_cm2: null, confidence: 'LOW' },
    quantityRegion: null
  };
}

/** OCR only, for callers that want tokens without the measurement stages. */
async function readTokens(file, options = {}) {
  const payload = await callVision('/ocr', {
    file,
    fields: { languages: (options.languages || ['en']).join(','), engine: options.engine }
  });

  if (!payload) {
    return { tokens: normalizeTokens(analyzeImage().tokens), engine: 'local-stub', source: 'local-stub' };
  }

  return {
    tokens: normalizeTokens(payload.tokens),
    engine: payload.engine,
    source: 'vision-service',
    processingTimeMs: payload.processing_time_ms
  };
}

/**
 * VLM pass over the two unstructured heads (manufacturer block, generic name).
 * Returns null when no provider is configured, which leaves those heads to the
 * regex tagger and officer review rather than failing the inspection.
 */
async function tagUnstructured(file, tokens = []) {
  const payload = await callVision('/tag', {
    file,
    fields: { tokens: tokens.map((t) => t.text).join('\n') }
  });

  return payload && payload.data ? payload.data : null;
}

async function status() {
  const payload = await callVision('/health', { method: 'GET' });

  if (!payload) {
    return {
      status: 'unavailable',
      service: OCR_SERVICE_URL,
      mode: 'local-stub',
      engines: [],
      stub: getServiceStatus()
    };
  }

  return {
    status: payload.status,
    service: OCR_SERVICE_URL,
    version: payload.version,
    mode: payload.status === 'healthy' ? 'vision-service' : 'degraded',
    engines: payload.engines || [],
    capabilities: payload.capabilities || {}
  };
}

module.exports = { analyze, readTokens, tagUnstructured, status, normalizeTokens };
