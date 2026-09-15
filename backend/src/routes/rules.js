const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const audit = require('../middleware/audit');
const RulePack = require('../models/RulePack');

router.use(protect);

// GET /api/rules/
router.get('/', async (req, res, next) => {
  try {
    const activePack = await RulePack.findOne({ isActive: true });
    res.status(200).json({ success: true, data: activePack ? activePack.rules : [] });
  } catch (error) {
    next(error);
  }
});

// GET /api/rules/checklist/:inspectionId
router.get('/checklist/:inspectionId', async (req, res, next) => {
  try {
    // In a real scenario, this would filter active rules based on product category extracted in inspection
    const activePack = await RulePack.findOne({ isActive: true });
    res.status(200).json({ success: true, data: activePack ? activePack.rules : [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/rules/packs
router.post('/packs', authorize('legal_officer'), audit, async (req, res, next) => {
  try {
    const pack = await RulePack.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: pack });
  } catch (error) {
    next(error);
  }
});

// GET /api/rules/packs
router.get('/packs', authorize('legal_officer', 'controller'), async (req, res, next) => {
  try {
    const packs = await RulePack.find().sort('-createdAt');
    res.status(200).json({ success: true, data: packs });
  } catch (error) {
    next(error);
  }
});

// PUT /api/rules/packs/:version/activate
router.put('/packs/:version/activate', authorize('legal_officer'), audit, async (req, res, next) => {
  try {
    await RulePack.updateMany({}, { isActive: false });
    const pack = await RulePack.findOneAndUpdate({ version: req.params.version }, { isActive: true }, { new: true });
    if (!pack) return res.status(404).json({ success: false, error: { message: 'Rule pack not found' } });
    res.status(200).json({ success: true, data: pack });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
