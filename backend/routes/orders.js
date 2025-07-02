const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Thêm đơn hàng
router.post('/', async (req, res) => {
  const { productId, name, price, image, quantity, userName, userPhone } = req.body;

  if (!productId || !userName || !userPhone) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn hàng hoặc người dùng.' });
  }

  const newOrder = new Order({
    productId,
    name,
    price,
    image,
    quantity,
    userName,
    userPhone,
    confirmed: false
  });

  try {
    await newOrder.save();
    res.json({ message: 'Đã thêm vào giỏ hàng!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm đơn hàng.', error: err });
  }
});

// Xem giỏ hàng của người dùng
router.get('/', async (req, res) => {
  const { name, phone } = req.query;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Thiếu thông tin người dùng.' });
  }

  try {
    const orders = await Order.find({ userName: name, userPhone: phone, confirmed: false });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.', error: err });
  }
});

// Xóa đơn hàng
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xóa đơn hàng', error: err });
  }
});
// Cập nhật số lượng
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    await Order.findByIdAndUpdate(req.params.id, { quantity });
    res.json({ message: 'Đã cập nhật số lượng' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật' });
  }
});


// Xác nhận đơn hàng
router.post('/confirm', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'Thiếu thông tin người dùng' });

  try {
    const result = await Order.updateMany(
      { name, phone, confirmed: { $ne: true } },
      { $set: { confirmed: true } }
    );

    res.json({ message: 'Đơn hàng đã xác nhận', result });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xác nhận đơn hàng', error: err });
  }
});

// Đặt hàng: POST /api/orders
router.post('/', async (req, res) => {
  const { productId, name, price, image, quantity, userName, userPhone } = req.body;

  if (!productId || !userName || !userPhone) {
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm hoặc người dùng.' });
  }

  try {
    const existing = await Order.findOne({ productId, userName, userPhone });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ message: 'Đã cập nhật số lượng trong giỏ hàng.' });
    }

    const newOrder = new Order({
      productId,
      name,
      price,
      image,
      quantity,
      userName,
      userPhone
    });

    await newOrder.save();
    res.json({ message: 'Đã thêm mới vào giỏ hàng!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
});


module.exports = router;
