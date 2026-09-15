const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const audit = require('../middleware/audit');
const Product = require('../models/Product');
const Inspection = require('../models/Inspection');

router.use(protect);
router.use(audit);

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).limit(50);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const inspections = await Inspection.find({ productId: req.params.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: inspections });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
