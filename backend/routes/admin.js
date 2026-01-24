const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require('../models/Order');
const authAdmin = require("../authAdmin");

/* ===== CHECK LOGIN ===== */
router.get("/check", (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    return res.json({ loggedIn: true });
  }
  res.status(401).json({ loggedIn: false });
});

/* ===== LẤY DANH SÁCH ===== */
router.get("/products", authAdmin, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* ===== THÊM ===== */
router.post("/products", authAdmin, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ message: "Thêm sản phẩm thành công" });
});

/* ===== SỬA ===== */
router.put("/products/:id", authAdmin, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Cập nhật thành công" });
});

/* ===== XÓA ===== */
router.delete("/products/:id", authAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa sản phẩm" });
});


/* ===== ADMIN XEM ĐƠN ĐÃ MUA ===== */
router.get("/orders", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ confirmed: true })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err });
  }
});

module.exports = router;
