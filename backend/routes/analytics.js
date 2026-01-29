const express = require("express");
const router = express.Router();
const ProductView = require("../models/ProductView");



router.post("/view-time", async (req, res) => {
  try {
    const { productId, timeSpent, sessionId, userId } = req.body;

    if (!productId || !timeSpent) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    await ProductView.create({
      productId,
      timeSpent,
      sessionId: sessionId || "guest-session",
      userId: userId || "guest"
    });

    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
