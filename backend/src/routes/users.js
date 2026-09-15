const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const audit = require('../middleware/audit');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

router.use(protect);
router.use(authorize('controller', 'auditor'));
router.use(audit);

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id
router.put('/:id', authorize('controller'), async (req, res, next) => {
  try {
    const { role, jurisdiction, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, jurisdiction, isActive }, { new: true, runValidators: true }).select('-passwordHash');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id (Soft delete)
router.delete('/:id', authorize('controller'), async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/audit
router.get('/:id/audit', async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ actor: req.params.id }).sort('-timestamp').limit(50);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
