const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const ProductView = require("../models/ProductView");
const Comment = require("../models/Comment");
const ProductVisit = require("../models/ProductVisit");

/* ================= DASHBOARD ANALYTICS ================= */
router.get("/dashboard", async (req, res) => {
  try {
    // 1️⃣ Tổng lượt xem (event-based)
    const totalViews = await ProductView.countDocuments();

    // 2️⃣ Phân loại hành vi người dùng
    const viewBehavior = {
      quick: await ProductView.countDocuments({ timeSpent: { $lt: 10 } }),
      normal: await ProductView.countDocuments({ timeSpent: { $gte: 10, $lt: 30 } }),
      deep: await ProductView.countDocuments({ timeSpent: { $gte: 30 } })
    };

    // 3️⃣ Đơn hàng & doanh thu
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + o.price * o.quantity,
      0
    );

    // 4️⃣ Tổng sản phẩm
    const totalProducts = await Product.countDocuments();

    // 5️⃣ Thời gian xem trung bình theo sản phẩm
    const avgTime = await ProductView.aggregate([
      {
        $group: {
          _id: "$productId",
          avgTime: { $avg: "$timeSpent" },
          views: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    // 6️⃣ Sentiment bình luận
    const sentiment = await Comment.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);

    // 7️⃣ Thống kê theo loại sản phẩm
    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    // 8️⃣ Repeat visit / customer interest
const repeatVisitAgg = await ProductVisit.aggregate([
  {
    $group: {
      _id: "$userId",
      totalVisits: { $sum: "$visitCount" }
    }
  }
]);

const repeatVisit = {
  once: repeatVisitAgg.filter(v => v.totalVisits === 1).length,
  repeat: repeatVisitAgg.filter(v => v.totalVisits > 1).length
};


    res.json({
      totalViews,
      totalOrders,
      totalRevenue,
      totalProducts,
      viewBehavior,
      avgTime,
      sentiment,
      categoryStats,
      repeatVisit,
      revenueByDate: "Demo – có thể mở rộng theo ngày"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});



/* ================= CHI TIẾT HÀNH VI XEM ================= */
router.get("/view-analysis", async (req, res) => {
  try {
    const data = await ProductView.aggregate([
      {
        $group: {
          _id: "$productId",
          avgTime: { $avg: "$timeSpent" },
          views: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
