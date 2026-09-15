const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const Inspection = require('../models/Inspection');
const AuditLog = require('../models/AuditLog');

router.use(protect);
router.use(authorize('controller', 'senior_inspector', 'auditor'));

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalScanned = await Inspection.countDocuments();
    const pendingReview = await Inspection.countDocuments({ status: 'under_review' });
    const nonCompliant = await Inspection.countDocuments({ verdict: 'non_compliant' });
    
    const complianceRate = totalScanned > 0 ? ((totalScanned - nonCompliant) / totalScanned) * 100 : 100;

    res.status(200).json({
      success: true,
      data: {
        totalScanned,
        pendingReview,
        totalViolations: nonCompliant,
        complianceRate: complianceRate.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/violations
router.get('/violations', async (req, res, next) => {
  try {
    // Aggregation to find most violated rules
    const violations = await Inspection.aggregate([
      { $unwind: "$results" },
      { $match: { "results.verdict": "FAIL" } },
      { $group: { _id: "$results.ruleId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.status(200).json({ success: true, data: violations });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/trends
router.get('/trends', async (req, res, next) => {
  try {
    // Stub trend data
    const trends = [
      { month: 'Jan', complianceRate: 90 },
      { month: 'Feb', complianceRate: 92 },
      { month: 'Mar', complianceRate: 88 }
    ];
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/pending
router.get('/pending', async (req, res, next) => {
  try {
    const pending = await Inspection.find({ status: 'under_review' }).limit(20).populate('officerId');
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/recent
router.get('/recent', async (req, res, next) => {
  try {
    const recent = await Inspection.find().sort('-createdAt').limit(10).populate('officerId');
    res.status(200).json({ success: true, data: recent });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
