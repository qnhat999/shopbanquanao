const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const AI_LABEL_MAP = require("./ai-label-map");

router.post("/", async (req, res) => {
  let { label } = req.body;

  if (!label) {
    return res.json({
      vi: "Không xác định",
      products: []
    });
  }

  // 🔹 Chuẩn hóa label AI
  label = label.toLowerCase().split(",")[0].trim();

  // 🔹 Tìm khớp trực tiếp
  let info = AI_LABEL_MAP[label];

  // 🔹 Fallback: tìm label gần đúng
  if (!info) {
    for (const key in AI_LABEL_MAP) {
      if (label.includes(key)) {
        info = AI_LABEL_MAP[key];
        break;
      }
    }
  }

  // ❌ Không nhận diện được
  if (!info) {
    return res.json({
      label,
      vi: "Không xác định",
      products: []
    });
  }

  // 🔹 Lấy sản phẩm theo category
  const products = await Product.find({
    category: info.category
  }).limit(6);

  res.json({
    label,
    vi: info.vi,
    category: info.category,
    products
  });
});

module.exports = router;
