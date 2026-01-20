const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");

// ===== BỎ DẤU TIẾNG VIỆT =====
function removeVietnameseTones(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/* ===============================
   🔍 SEARCH SẢN PHẨM (NHẸ + NHANH)
================================ */
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const keyword = removeVietnameseTones(q.toLowerCase());

    const products = await Product.find()
      .select("name price image type category") // ✅ chỉ lấy field cần
      .lean(); // ✅ nhanh hơn

    const result = products
      .map(p => {
        const name = removeVietnameseTones(p.name.toLowerCase());
        let score = 0;

        keyword.split(" ").forEach(word => {
          if (name.includes(word)) score += 2;
        });

        return score > 0 ? { ...p, score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Search error" });
  }
});

/* ===============================
   📦 LẤY SẢN PHẨM THEO TYPE
================================ */
router.get("/", async (req, res) => {
  try {
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const filter = type ? { type } : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.json(products);
  } catch {
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm" });
  }
});

/* ===============================
   🤖 AI GỢI Ý SẢN PHẨM
================================ */
router.get("/recommend/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.json([]);

    const current = await Product.findById(req.params.id).lean();
    if (!current) return res.json([]);

    const priceRange = 100000;

    const products = await Product.find({
      _id: { $ne: current._id },
      category: current.category,
      price: {
        $gte: current.price - priceRange,
        $lte: current.price + priceRange
      }
    })
      .limit(4)
      .lean();

    res.json(products);
  } catch {
    res.status(500).json({ error: "AI recommend error" });
  }
});

/* ===============================
   ➕ THÊM SẢN PHẨM
================================ */
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: "Lỗi thêm sản phẩm", details: error.message });
  }
});

/* ===============================
   ✏️ UPDATE SẢN PHẨM
================================ */
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID không hợp lệ" });

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    res.json(updated);
  } catch {
    res.status(400).json({ error: "Lỗi cập nhật sản phẩm" });
  }
});

/* ===============================
   ❌ XÓA SẢN PHẨM
================================ */
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID không hợp lệ" });

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    res.json({ message: "Đã xóa sản phẩm" });
  } catch {
    res.status(400).json({ error: "Lỗi xóa sản phẩm" });
  }
});

module.exports = router;
