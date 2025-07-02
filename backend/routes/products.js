const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ [GET] Tìm kiếm sản phẩm theo tên: /api/products/search?q=ao
// GET /api/products/search?q=keyword
router.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  const regex = new RegExp(keyword, 'i'); // không phân biệt hoa thường
  const results = await Product.find({ name: regex });
  res.json(results);
});


// ✅ [GET] Lấy danh sách sản phẩm (lọc theo type): /api/products?type=new
router.get('/', async (req, res) => {
  const { type, page = 1, limit = 100 } = req.query;
  const filter = type ? { type } : {};
  try {
    const products = await Product.find(filter)
      .sort({ _id: -1 })             // mới nhất lên đầu
      .limit(parseInt(limit))        // giới hạn số lượng
      .skip((parseInt(page) - 1) * parseInt(limit)); // phân trang
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm' });
  }
});

// ✅ [POST] Thêm sản phẩm mới: /api/products
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi thêm sản phẩm' });
  }
});

// ✅ [PUT] Cập nhật sản phẩm theo ID: /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi cập nhật sản phẩm' });
  }
});

// ✅ [DELETE] Xóa sản phẩm theo ID: /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi xóa sản phẩm' });
  }
});

module.exports = router;
