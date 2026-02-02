const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const ProductView = require("../models/ProductView");
const Comment = require("../models/Comment");
const ProductVisit = require("../models/ProductVisit");
const UserVector = require("../models/UserVector");

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
router.post("/track", async (req, res) => {
  try {
    const {
      userId,
      type = "guest",
      dwellTime = 0,
      scrollDepth = 0,
      heartbeatCount = 0
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    let vector = await UserVector.findOne({ userId });

    if (!vector) {
      vector = new UserVector({
        userId,
        type,
        behavioral: {
          dwellTime: 0,
          scrollDepth: 0,
          heartbeatCount: 0
        }
      });
    }

    /* ===== UPDATE BEHAVIOR ===== */
    vector.behavioral.dwellTime += dwellTime;
    vector.behavioral.scrollDepth = Math.max(
      vector.behavioral.scrollDepth,
      scrollDepth
    );
    vector.behavioral.heartbeatCount += heartbeatCount;

    /* ===== COMBINED VECTOR ===== */
    vector.combinedVector = [
      vector.behavioral.dwellTime,
      vector.behavioral.scrollDepth,
      vector.behavioral.heartbeatCount,
      vector.psychological?.sentimentScore || 0,
      vector.historical?.recency || 0,
      vector.historical?.frequency || 0,
      vector.historical?.monetary || 0
    ];

    vector.updatedAt = new Date();
    await vector.save();

    res.json({ message: "Tracked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADMIN VIEW ANALYTICS ================= */
router.get("/users", async (req, res) => {
  const users = await UserVector.find();

  const totalUsers = users.length;
  const guestUsers = users.filter(u => u.type === "guest").length;
  const returningUsers = users.filter(u => u.type === "returning").length;

  const avgDwellTime =
    users.reduce((s, u) => s + u.behavioral.dwellTime, 0) /
    (totalUsers || 1);

  const avgScrollDepth =
    users.reduce((s, u) => s + u.behavioral.scrollDepth, 0) /
    (totalUsers || 1);

  res.json({
    totalUsers,
    guestUsers,
    returningUsers,
    avgDwellTime: Math.round(avgDwellTime),
    avgScrollDepth: Math.round(avgScrollDepth)
  });
});



module.exports = router;
