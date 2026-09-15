const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const audit = require('../middleware/audit');
const Report = require('../models/Report');
const Inspection = require('../models/Inspection');
const { getGridFSBucket } = require('../config/db');

// Public route - Verify Report
router.get('/verify/:qrToken', async (req, res, next) => {
  try {
    const report = await Report.findOne({ qrToken: req.params.qrToken }).populate('inspectionId');
    if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found or invalid QR token' } });
    
    res.status(200).json({ success: true, data: { isValid: true, issuedAt: report.issuedAt, format: report.format } });
  } catch (error) {
    next(error);
  }
});

router.use(protect);
router.use(audit);

// POST /api/reports/generate/:inspectionId
router.post('/generate/:inspectionId', authorize('controller', 'senior_inspector'), async (req, res, next) => {
  try {
    const { format } = req.body; // 'pdf', 'docx', 'xlsx'
    const inspection = await Inspection.findById(req.params.inspectionId);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    const qrToken = crypto.randomBytes(16).toString('hex');
    
    // Stub implementation: normally you would generate the file, upload to GridFS, and save the report doc
    const report = await Report.create({
      inspectionId: inspection._id,
      format,
      issuedBy: req.user._id,
      qrToken
    });
    
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/:id/download
router.get('/:id/download', async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.fileId) return res.status(404).json({ success: false, error: { message: 'File not found' } });
    
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(report.fileId);
    
    res.set('Content-Type', report.format === 'pdf' ? 'application/pdf' : 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="Report_${report.inspectionId}.${report.format}"`);
    
    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
