const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const audit = require('../middleware/audit');
const { single, array } = require('../middleware/upload');
const Inspection = require('../models/Inspection');
const Product = require('../models/Product');
const { getGridFSBucket } = require('../config/db');

router.use(protect);
router.use(audit);

// POST /api/inspections - Create
router.post('/', authorize('field_inspector', 'senior_inspector'), async (req, res, next) => {
  try {
    const { productId, geo } = req.body;
    const inspection = await Inspection.create({
      officerId: req.user._id,
      productId,
      geo
    });
    res.status(201).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// GET /api/inspections - List
router.get('/', async (req, res, next) => {
  try {
    const { status, verdict, officerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (verdict) query.verdict = verdict;
    if (officerId) query.officerId = officerId;
    
    const inspections = await Inspection.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: inspections });
  } catch (error) {
    next(error);
  }
});

// GET /api/inspections/:id - Get one
router.get('/:id', async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id).populate('officerId productId');
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inspections/:id/extract - OCR Extractor
router.put('/:id/extract', authorize('field_inspector', 'senior_inspector'), async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    // Stub OCR Service Response
    inspection.extracted = {
      mrp: { value: 100, wording: "Rs. 100", raw: "MRP Rs 100" },
      netQuantity: { value: 500, unit: "g", raw: "Net Wt: 500g" },
      genericName: "Sample Product"
    };
    inspection.status = 'extracted';
    await inspection.save();
    
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inspections/:id/evaluate - Rule Engine
router.put('/:id/evaluate', async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    // Stub Rule Engine Evaluation
    inspection.results = [
      { ruleId: 'R1', check: 'MRP Present', verdict: 'PASS', confidence: 0.95 },
      { ruleId: 'R2', check: 'Net Quantity Format', verdict: 'FAIL', confidence: 0.88 }
    ];
    inspection.status = 'under_review';
    await inspection.save();
    
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inspections/:id/override - Override result
router.put('/:id/override', authorize('senior_inspector', 'controller'), async (req, res, next) => {
  try {
    const { ruleId, overrideVerdict, overrideReason } = req.body;
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    const result = inspection.results.find(r => r.ruleId === ruleId);
    if (result) {
      result.overridden = true;
      result.overrideVerdict = overrideVerdict;
      result.overrideReason = overrideReason;
      result.overrideBy = req.user._id;
      result.overrideAt = Date.now();
    }
    
    await inspection.save();
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inspections/:id/adjudicate
router.put('/:id/adjudicate', authorize('controller', 'senior_inspector'), async (req, res, next) => {
  try {
    const { verdict, remarks } = req.body;
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    inspection.verdict = verdict;
    inspection.remarks = remarks;
    inspection.status = 'adjudicated';
    await inspection.save();
    
    if (inspection.productId) {
      await Product.findByIdAndUpdate(inspection.productId, {
        $push: { complianceHistory: { inspectionId: inspection._id, verdict, date: Date.now() } }
      });
    }
    
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// POST /api/inspections/:id/attachments
router.post('/:id/attachments', array, async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    
    const bucket = getGridFSBucket();
    const attachments = [];
    
    for (const file of req.files) {
      const uploadStream = bucket.openUploadStream(file.originalname, { contentType: file.mimetype });
      uploadStream.end(file.buffer);
      
      const fileId = uploadStream.id;
      attachments.push({ fileId, mimeType: file.mimetype, description: 'Attachment' });
    }
    
    inspection.attachments.push(...attachments);
    await inspection.save();
    
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inspections/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const inspection = await Inspection.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
