const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const audit = require('../middleware/audit');
const Report = require('../models/Report');
const Inspection = require('../models/Inspection');
const { getGridFSBucket } = require('../config/db');
const { generatePDF, generateDOCX, generateXLSX } = require('../services/reportService');
const {
  generateExtractionPDF,
  generateExtractionXLSX
} = require('../services/extractionReportService');
const { EXTRACTION_MODE } = require('../config/env');
const { saveToGridFS } = require('../services/imageService');
const { computeHash } = require('../utils/hashUtils');

const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Public route - verify a report from its QR token, without exposing the file.
router.get('/verify/:qrToken', async (req, res, next) => {
  try {
    const report = await Report.findOne({ qrToken: req.params.qrToken }).populate(
      'inspectionId',
      'ref verdict status createdAt'
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { message: 'No report matches this verification token', code: 404 }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isValid: true,
        format: report.format,
        issuedAt: report.issuedAt,
        hash: report.hash,
        inspectionRef: report.inspectionId && report.inspectionId.ref,
        verdict: report.inspectionId && report.inspectionId.verdict
      }
    });
  } catch (error) {
    next(error);
  }
});

router.use(protect);
router.use(audit);

// POST /api/reports/generate/:inspectionId
router.post(
  '/generate/:inspectionId',
  authorize('controller', 'senior_inspector', 'legal_officer'),
  async (req, res, next) => {
    try {
      const format = String(req.body.format || 'pdf').toLowerCase();

      if (!MIME_TYPES[format]) {
        return res.status(400).json({
          success: false,
          error: { message: 'format must be pdf, docx or xlsx', code: 400 }
        });
      }

      const inspection = await Inspection.findById(req.params.inspectionId).populate('productId');
      if (!inspection) {
        return res
          .status(404)
          .json({ success: false, error: { message: 'Inspection not found', code: 404 } });
      }

      const qrToken = crypto.randomBytes(16).toString('hex');
      const verifyUrl = `${req.protocol}://${req.get('host')}/api/reports/verify/${qrToken}`;
      const product = inspection.productId;

      let buffer;

      if (EXTRACTION_MODE === 'gemini') {
        // Extraction mode produces a client extraction report, not a compliance
        // certificate -- there are no verdicts to certify while the rule engine
        // is dormant. DOCX is not offered here because the extraction report is
        // a record of a reading, not a document meant to be edited afterwards.
        const report = inspection.extractionReport;

        if (!report) {
          return res.status(409).json({
            success: false,
            error: {
              message:
                'This inspection has no extraction yet. Capture an image first, then ' +
                'download the report.',
              code: 409
            }
          });
        }

        if (format === 'docx') {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Extraction reports are available as PDF or XLSX.',
              code: 400
            }
          });
        }

        buffer =
          format === 'pdf'
            ? await generateExtractionPDF(inspection, report)
            : Buffer.from(await generateExtractionXLSX(inspection, report));
      } else if (format === 'pdf') {
        buffer = await generatePDF(inspection, product, { verifyUrl });
      } else if (format === 'docx') {
        buffer = await generateDOCX(inspection, product);
      } else {
        buffer = Buffer.from(await generateXLSX(inspection, product));
      }

      const fileId = await saveToGridFS(
        getGridFSBucket(),
        buffer,
        `${inspection.ref}.${format}`,
        { contentType: MIME_TYPES[format], inspectionId: inspection._id.toString() }
      );

      const report = await Report.create({
        inspectionId: inspection._id,
        format,
        fileId,
        hash: computeHash(buffer),
        issuedBy: req.user._id,
        qrToken
      });

      res.status(201).json({
        success: true,
        data: { ...report.toObject(), size: buffer.length, verifyUrl }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/reports/inspection/:inspectionId - reports already issued
router.get('/inspection/:inspectionId', async (req, res, next) => {
  try {
    const reports = await Report.find({ inspectionId: req.params.inspectionId })
      .sort('-issuedAt')
      .populate('issuedBy', 'displayName');

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/:id/download
router.get('/:id/download', async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('inspectionId', 'ref');

    if (!report || !report.fileId) {
      return res
        .status(404)
        .json({ success: false, error: { message: 'Report file not found', code: 404 } });
    }

    const filename = `${(report.inspectionId && report.inspectionId.ref) || 'report'}.${report.format}`;

    res.set('Content-Type', MIME_TYPES[report.format] || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.set('X-Report-Hash', report.hash || '');

    const stream = getGridFSBucket().openDownloadStream(report.fileId);
    stream.on('error', () => {
      if (!res.headersSent) {
        res
          .status(404)
          .json({ success: false, error: { message: 'Report file could not be read', code: 404 } });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
