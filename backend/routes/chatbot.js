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

    // ================== GIỚI THIỆU SHOP ==================
    if (
      text.includes('shop') ||
      text.includes('bán gì') ||
      text.includes('có gì') ||
      text.includes('mặt hàng')
    ) {
      return res.json({
        reply: '🛍️ Shop chuyên quần áo nam & nữ: áo thun, áo sơ mi, áo khoác, quần, váy, bộ đồ. Giá sinh viên.'
      });
    }

    // ================== ĐỒ NAM / ĐỒ NỮ ==================
    if (
      text.includes('áo nữ') ||
      text.includes('đồ nữ') ||
      text.includes('quần nữ') ||
      text.includes('váy')
    ) {
      return res.json({
        reply: '👗 Shop có đồ nữ nha: váy, áo thun nữ, áo sơ mi nữ, set đồ nữ thời trang.'
      });
    }

    if (
      text.includes('áo nam') ||
      text.includes('đồ nam') ||
      text.includes('quần nam')
    ) {
      return res.json({
        reply: '👕 Shop có đầy đủ đồ nam: áo thun, áo sơ mi, áo khoác, quần jean, quần kaki.'
      });
    }

    // ================== GIÁ TIỀN ==================
    if (
      text.includes('bao nhiêu tiền') ||
      text.includes('giá') ||
      text.includes('dưới')
    ) {
      return res.json({
        reply: '💰 Giá sản phẩm dao động từ 150.000đ – 500.000đ, phù hợp sinh viên.'
      });
    }

    // ================== GIAO HÀNG ==================
    if (
      text.includes('giao hàng') ||
      text.includes('ship') ||
      text.includes('vận chuyển')
    ) {
      return res.json({
        reply: '🚚 Shop giao hàng toàn quốc, thời gian 2–5 ngày tùy khu vực.'
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
        reply: '🔁 Shop hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm lỗi.'
      });
    }

    // ================== KHUYẾN MÃI ==================
    if (
      text.includes('khuyến mãi') ||
      text.includes('sale') ||
      text.includes('giảm giá')
    ) {
      return res.json({
        reply: '🔥 Hiện shop đang có nhiều sản phẩm giảm giá, bạn xem mục Khuyến mãi nhé!'
      });
    }

    // ================== LIÊN HỆ ==================
    if (
      text.includes('liên hệ') ||
      text.includes('số điện thoại') ||
      text.includes('hotline')
    ) {
      return res.json({
        reply: '📞 Hotline: 0123 456 789 (8h – 22h mỗi ngày).'
      });
    }

    // ================== MẶC ĐỊNH ==================
    return res.json({
      reply:
        '🤖 Mình chưa hiểu lắm 😅\nBạn thử hỏi:\n- "shop bán gì"\n- "có áo nữ không"\n- "giao hàng thế nào"\n- "giá bao nhiêu"'
    });

  } catch (err) {
    console.error('CHATBOT ERROR:', err);
    res.status(500).json({ reply: '⚠️ Lỗi chatbot.' });
  }
});

module.exports = router;
