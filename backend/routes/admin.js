const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const Comment = require("../models/Comment"); // 🔥 THÊM
const authAdmin = require("../authAdmin");
const ProductView = require("../models/ProductView");


/* ===== CHECK LOGIN ===== */
router.get("/check", (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    return res.json({ loggedIn: true });
  }
  res.status(401).json({ loggedIn: false });
});

/* ===== PRODUCTS ===== */
router.get("/products", authAdmin, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post("/products", authAdmin, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ message: "Thêm sản phẩm thành công" });
});

router.put("/products/:id", authAdmin, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Cập nhật thành công" });
});

router.delete("/products/:id", authAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa sản phẩm" });
});

/* ===== ORDERS ===== */
router.get("/orders", authAdmin, async (req, res) => {
  const orders = await Order.find({ confirmed: true })
    .sort({ createdAt: -1 });
  res.json(orders);
});

/* ===== ANALYTICS DASHBOARD ===== */
router.get("/analytics", authAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalViews = await ProductView.countDocuments();
    const totalOrders = await Order.countDocuments({ confirmed: true });

    const revenueAgg = await Order.aggregate([
      { $match: { confirmed: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // 🔥 SENTIMENT AGGREGATE
    const sentiment = await Comment.aggregate([
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 }
        }
      }
    ]);
    const avgTimeAgg = await ProductView.aggregate([
  {
    $group: {
      _id: null,
      avgTime: { $avg: "$timeSpent" }
    }
  }
]);

const avgViewTime = avgTimeAgg[0]?.avgTime || 0;
const viewBehavior = {
  quick: await ProductView.countDocuments({ timeSpent: { $lt: 10 } }),
  normal: await ProductView.countDocuments({ timeSpent: { $gte: 10, $lt: 30 } }),
  deep: await ProductView.countDocuments({ timeSpent: { $gte: 30 } })
};

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalViews,
      avgViewTime,   
      viewBehavior,
      sentiment // 🔥 TRẢ VỀ
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
  

});

module.exports = router;
