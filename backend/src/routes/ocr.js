const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { single } = require('../middleware/upload');
const { OCR_SERVICE_URL } = require('../config/env');

router.use(protect);

// POST /api/ocr/analyze
router.post('/analyze', single, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'Image file is required' } });
    }
    
    // In a real application, you would send req.file.buffer to the OCR_SERVICE_URL
    // Here we stub the response
    const stubTokens = [
      { text: 'MRP', bbox: [10, 10, 50, 20], confidence: 0.99 },
      { text: 'Rs. 100', bbox: [60, 10, 100, 20], confidence: 0.98 }
    ];

    res.status(200).json({ success: true, data: { tokens: stubTokens } });
  } catch (error) {
    next(error);
  }
});

// GET /api/ocr/status
router.get('/status', (req, res) => {
  // Stub health check
  res.status(200).json({ success: true, data: { status: 'healthy', service: OCR_SERVICE_URL } });
});

module.exports = router;
