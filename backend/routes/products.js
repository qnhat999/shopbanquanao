const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// [GET] Tìm kiếm sản phẩm theo tên: /api/products/search?q=keyword
router.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  const regex = new RegExp(keyword, 'i'); // không phân biệt hoa thường

  try {
    const results = await Product.find({ name: regex });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tìm kiếm sản phẩm' });
  }
});

// [GET] Lấy danh sách sản phẩm, có lọc theo type + phân trang
router.get('/', async (req, res) => {
  const { type, page = 1, limit = 100 } = req.query;
  const filter = type ? { type } : {};

  try {
    const products = await Product.find(filter)
      .sort({ _id: -1 }) // sắp xếp mới nhất
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm' });
  }
});

// [POST] Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi thêm sản phẩm', details: error });
  }
});

// [PUT] Cập nhật sản phẩm theo ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi cập nhật sản phẩm', details: error });
  }
});

// [DELETE] Xóa sản phẩm theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy sản phẩm để xóa' });

    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi xóa sản phẩm', details: error });
  }
});

module.exports = router;
