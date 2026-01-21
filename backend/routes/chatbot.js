const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({
        reply: '🤖 Bạn muốn hỏi gì về shop nè?'
      });
    }

    const text = message.toLowerCase();

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

    if (
      text.includes('giờ mở') ||
      text.includes('mở cửa') ||
      text.includes('đóng cửa')
    ) {
      return res.json({
        reply: '⏰ Shop online 24/7, xử lý đơn hàng từ 8h–22h mỗi ngày.'
      });
    }

    if (
      text.includes('giao hàng') ||
      text.includes('ship') ||
      text.includes('vận chuyển')
    ) {
      return res.json({
        reply: '🚚 Shop giao hàng toàn quốc, 2–5 ngày tùy khu vực.'
      });
    }

    if (
      text.includes('thanh toán') ||
      text.includes('trả tiền') ||
      text.includes('cod')
    ) {
      return res.json({
        reply: '💳 Shop hỗ trợ thanh toán khi nhận hàng (COD).'
      });
    }

    if (
      text.includes('đổi') ||
      text.includes('trả hàng') ||
      text.includes('hoàn tiền')
    ) {
      return res.json({
        reply: '🔁 Shop hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi.'
      });
    }

    if (
      text.includes('khuyến mãi') ||
      text.includes('sale') ||
      text.includes('giảm giá')
    ) {
      return res.json({
        reply: '🔥 Shop đang có nhiều sản phẩm giảm giá, bạn xem mục Khuyến mãi nhé!'
      });
    }

    if (
      text.includes('liên hệ') ||
      text.includes('số điện thoại') ||
      text.includes('hotline')
    ) {
      return res.json({
        reply: '📞 Hotline: 0123 456 789 (8h–22h).'
      });
    }

    return res.json({
      reply: '🤖 Mình chưa hiểu. Bạn thử hỏi: "shop bán gì", "có giao hàng không?", "áo nam dưới 300k".'
    });

  } catch (err) {
    console.error('CHATBOT ERROR:', err);
    res.status(500).json({ reply: '⚠️ Lỗi chatbot.' });
  }
});

module.exports = router;
