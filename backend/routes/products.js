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
   🔍 SEARCH SẢN PHẨM
================================ */
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const keyword = removeVietnameseTones(q.toLowerCase());

    const products = await Product.find()
      .select("name price image type category rating") // ✅ FIX: thêm rating
      .lean();

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
   🤖 AI SEARCH BY LABEL
================================ */
router.get("/ai-search", async (req, res) => {
  try {
    const label = req.query.label;
    if (!label) return res.json([]);

    const keyword = removeVietnameseTones(label.toLowerCase());

    const products = await Product.find()
      .select("name price image category rating") // ✅ FIX: thêm rating
      .lean();

    const result = products.filter(p => {
      const name = removeVietnameseTones(p.name.toLowerCase());
      const category = removeVietnameseTones(
        (p.category || "").toLowerCase()
      );

      return (
        name.includes(keyword) ||
        category.includes(keyword) ||
        keyword.includes(name)
      );
    });

    res.json(result.slice(0, 4));
  } catch {
    res.status(500).json({ error: "AI search error" });
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
      .lean(); // ✅ rating tự có

    res.json(products);
  } catch {
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm" });
  }
});

/* ===============================
   🤖 AI GỢI Ý THEO ID
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
      .select("name price image rating category") // ✅ FIX
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
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({
      message: "Lỗi thêm sản phẩm",
      error: err.message
    });
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


router.post("/:id/view", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
