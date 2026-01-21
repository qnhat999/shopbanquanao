const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const labelMap = require('./ai-label-map');

// POST /api/scan
router.post('/', async (req, res) => {
  try {
    const { label } = req.body;

    if (!label) {
      return res.status(400).json({
        success: false,
        message: 'No label provided'
      });
    }

    // map nhãn AI → category trong DB
    const mappedCategory = labelMap[label.toLowerCase()] || null;

    if (!mappedCategory) {
      return res.json({
        success: true,
        label,
        products: []
      });
    }

    // lấy sản phẩm theo category
    const products = await Product.find({
      category: mappedCategory
    }).limit(6);

    res.json({
      success: true,
      label,
      category: mappedCategory,
      products
    });

  } catch (err) {
    console.error('SCAN ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
