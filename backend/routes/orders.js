const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Comment = require("../models/Comment");

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

function analyzeSentiment(text = "") {
  const lower = text.toLowerCase();
  let score = 0;

  positiveWords.forEach(w => {
    if (lower.includes(w)) score++;
  });

  negativeWords.forEach(w => {
    if (lower.includes(w)) score--;
  });

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

/* ================== GET CART ================== */
router.get("/", async (req, res) => {
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).json({ message: "Thiếu name hoặc phone" });
  }

  const orders = await Order.find({
    userName: name,
    userPhone: phone,
    confirmed: false
  });

  res.json(orders);
});

/* ================== ADD TO CART ================== */
router.put("/", async (req, res) => {
  try {
    const {
      productId,
      name,
      price,
      image,
      quantity,
      userName,
      userPhone
    } = req.body;

    if (!userName || !userPhone) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    let order = await Order.findOne({
      productId,
      userName,
      userPhone,
      confirmed: false
    });

    if (order) {
      order.quantity += quantity || 1;
    } else {
      order = new Order({
        productId,
        name,
        price,
        image,
        quantity: quantity || 1,
        userName,
        userPhone
      });
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ================== CONFIRM ORDER + CREATE COMMENT ================== */
router.put("/confirm", async (req, res) => {
  try {
    const { userName, userPhone, address, note } = req.body;

    if (!userName || !userPhone || !address) {
      return res.status(400).json({
        message: "Thiếu thông tin xác nhận đơn hàng"
      });
    }

    // lấy các đơn chưa confirm
    const orders = await Order.find({
      userName,
      userPhone,
      confirmed: false
    });

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Không có đơn hàng nào để xác nhận"
      });
    }

    // confirm đơn
    await Order.updateMany(
      { userName, userPhone, confirmed: false },
      { $set: { address, note, confirmed: true } }
    );

    // 👉 tạo comment từ note
    if (note && note.trim() !== "") {
      for (const o of orders) {
        await Comment.create({
          productId: o.productId,
          userId: userPhone, // dùng sdt làm userId
          content: note,
          sentiment: analyzeSentiment(note)
        });
      }
    }

    res.json({
      message: "✅ Xác nhận đơn hàng + lưu đánh giá thành công",
      totalOrders: orders.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ================== UPDATE QUANTITY ================== */
router.put("/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      quantity: req.body.quantity
    });
    res.json({ message: "Đã cập nhật số lượng" });
  } catch {
    res.status(500).json({ message: "Không thể cập nhật" });
  }
});

/* ================== DELETE ITEM ================== */
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đơn hàng" });
  } catch {
    res.status(500).json({ message: "Không thể xóa đơn hàng" });
  }
});

module.exports = router;
