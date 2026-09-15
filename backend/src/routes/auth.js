const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY, REFRESH_EXPIRY } = require('../config/env');
const User = require('../models/User');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const generateTokens = (id) => {
  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const refreshToken = jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { token, refreshToken };
};

// POST /api/auth/register (controller/admin only)
router.post('/register', protect, authorize('controller'), async (req, res, next) => {
  try {
    const { email, password, role, jurisdiction, displayName } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: { message: 'User already exists' } });
    }
    
    user = await User.create({
      email,
      passwordHash: password, // pre-save hook handles hashing
      role,
      jurisdiction,
      displayName
    });
    
    res.status(201).json({
      success: true,
      data: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Please provide email and password' } });
    }
    
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials or inactive user' } });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }
    
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    const tokens = generateTokens(user._id);
    
    res.status(200).json({ success: true, data: { ...tokens, user: { id: user._id, email: user.email, role: user.role } } });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { message: 'No refresh token provided' } });
    }
    
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.id);
    
    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res, next) => {
  // Can be implemented with a redis blacklist, for now client-side is fine
  res.status(200).json({ success: true, data: {} });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
});

module.exports = router;
