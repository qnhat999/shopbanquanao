const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const authAdmin = require("../authAdmin");


/* ================== SENTIMENT KEYWORDS ================== */
const positiveWords = [
  "tốt",
  "đẹp",
  "xịn",
  "ưng",
  "hài lòng",
  "chất lượng",
  "đáng tiền",
  "ok",
  "ổn",
  "tuyệt",
  "thích",
  "đẹp lắm",
  "mua lại"
];

const negativeWords = [
  "xấu",
  "tệ",
  "kém",
  "không tốt",
  "không hài lòng",
  "chán",
  "thất vọng",
  "lỗi",
  "không ổn",
  "tệ quá"
];


/* ================== SENTIMENT ANALYSIS ================== */
function analyzeSentiment(text = "") {
  const lower = text.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (lower.includes(word)) score++;
  });

  negativeWords.forEach(word => {
    if (lower.includes(word)) score--;
  });

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

/* ================== CREATE COMMENT ================== */
router.post("/", async (req, res) => {
  try {
    const { productId, userId, content } = req.body;

    // validate
    if (!productId || !content) {
      return res.status(400).json({
        message: "Thiếu productId hoặc content"
      });
    }

    // sentiment
    const sentiment = analyzeSentiment(content);

    // save
    const comment = await Comment.create({
      productId,
      userId,
      content,
      sentiment
    });

    res.json(comment);
  } catch (err) {
    console.error("❌ Lỗi tạo comment:", err);
    res.status(500).json({
      message: "Lỗi server khi tạo comment"
    });
  }
});


/* ================== ADMIN: GET ALL COMMENTS ================== */
router.get("/admin/all", authAdmin, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy comment admin" });
  }
});

/* ================== ADMIN: SENTIMENT STATS ================== */
router.get("/admin/sentiment", authAdmin, async (req, res) => {
  try {
    const data = await Comment.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê sentiment" });
  }
});

/* ================== GET COMMENTS BY PRODUCT ================== */
router.get("/:productId", async (req, res) => {
  try {
    const comments = await Comment.find({
      productId: req.params.productId
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lấy comment"
    });
  }
});


module.exports = router;
