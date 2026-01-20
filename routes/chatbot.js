const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.post('/', async (req, res) => {
  const { message } = req.body;
  const text = message.toLowerCase();

  try {
  // ================== 2. HỎI VỀ SHOP ==================
if (
  text.includes('shop') ||
  text.includes('bán gì') ||
  text.includes('có gì') ||
  text.includes('mặt hàng')
) {
  return res.json({
    reply: '🛍️ Shop chuyên quần áo nam nữ: áo thun, áo sơ mi, quần jean, quần kaki, giá sinh viên.'
  });
}

// ================== GIỜ MỞ CỬA ==================
if (
  text.includes('giờ mở') ||
  text.includes('mở cửa') ||
  text.includes('đóng cửa')
) {
  return res.json({
    reply: '⏰ Shop online 24/7, xử lý đơn hàng từ 8h–22h mỗi ngày.'
  });
}

// ================== GIAO HÀNG ==================
if (
  text.includes('giao hàng') ||
  text.includes('ship') ||
  text.includes('vận chuyển')
) {
  return res.json({
    reply: '🚚 Shop giao hàng toàn quốc, nhận hàng từ 2–5 ngày tùy khu vực.'
  });
}

// ================== THANH TOÁN ==================
if (
  text.includes('thanh toán') ||
  text.includes('trả tiền') ||
  text.includes('cod')
) {
  return res.json({
    reply: '💳 Shop hỗ trợ thanh toán khi nhận hàng (COD).'
  });
}

// ================== ĐỔI TRẢ ==================
if (
  text.includes('đổi') ||
  text.includes('trả hàng') ||
  text.includes('hoàn tiền')
) {
  return res.json({
    reply: '🔁 Shop hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi.'
  });
}

// ================== KHUYẾN MÃI ==================
if (
  text.includes('khuyến mãi') ||
  text.includes('sale') ||
  text.includes('giảm giá')
) {
  return res.json({
    reply: '🔥 Shop đang có nhiều sản phẩm giảm giá, bạn xem mục Khuyến mãi nhé!'
  });
}

// ================== LIÊN HỆ ==================
if (
  text.includes('liên hệ') ||
  text.includes('số điện thoại') ||
  text.includes('hotline')
) {
  return res.json({
    reply: '📞 Hotline hỗ trợ: 0123 456 789 (8h–22h).'
  });
}

// ================== 3. KHÔNG HIỂU ==================
return res.json({
  reply: '🤖 Mình chưa hiểu câu hỏi. Bạn có thể hỏi như: "áo nam dưới 300k", "shop bán gì", "có giao hàng không?"'
});


  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: '⚠️ Lỗi chatbot.' });
  }
});

module.exports = router;
