const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const labelMap = require('./ai-label-map');

router.post('/', async (req, res) => {
  try {
    const { label } = req.body;

    if (!label) {
      return res.status(400).json({
        success: false,
        message: 'No label provided'
      });
    }

    const cleanLabel = label
      .toLowerCase()
      .split(',')[0]
      .trim();

    let mappedCategory = null;
    let viLabel = null;

    // 🔍 MATCH KEYWORD (ARRAY + KEYWORDS)
    for (const item of labelMap) {

      // ✅ clone + sort keyword dài trước
      const sortedKeywords = [...item.keywords].sort(
        (a, b) => b.length - a.length
      );

      for (const kw of sortedKeywords) {
        if (cleanLabel.includes(kw)) {
          mappedCategory = item.category;
          viLabel = item.vi;
          break;
        }
      }

      if (mappedCategory) break;
    }

    // 🔎 QUERY DB
    const query = mappedCategory
      ? {
          $or: [
            { category: mappedCategory },
            { name: { $regex: cleanLabel, $options: 'i' } }
          ]
        }
      : { name: { $regex: cleanLabel, $options: 'i' } };

    const products = await Product.find(query).limit(6);

    res.json({
      success: true,
      label: cleanLabel,
      viLabel,
      category: mappedCategory,
      message: products.length
        ? 'Sản phẩm phù hợp'
        : 'Không tìm thấy sản phẩm phù hợp',
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
