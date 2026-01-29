const express = require("express");
const router = express.Router();
const ProductVisit = require("../models/ProductVisit");

// Ghi nhận lượt xem sản phẩm
router.post("/", async (req, res) => {
  try {
    const { productId, userId = "guest" } = req.body;

    let visit = await ProductVisit.findOne({ productId, userId });

    if (!visit) {
      await ProductVisit.create({ productId, userId });
    } else {
      visit.visitCount += 1;
      visit.lastVisitedAt = Date.now();
      await visit.save();
    }

    res.json({ message: "Visit recorded successfully" });
  } catch (error) {
    console.error("Visit error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
