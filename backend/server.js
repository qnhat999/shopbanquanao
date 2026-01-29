require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const scanRoutes = require('./routes/scan');
const chatbotRoutes = require('./routes/chatbot');

const adminRoutes = require('./routes/admin');         // CRUD
const adminAuthRoutes = require('./routes/adminAuth'); // LOGIN
const adminAnalytics = require("./routes/adminAnalytics");
const commentRoutes = require("./routes/comments");
const visitRoutes = require("./routes/visits");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.text({ type: "*/*" }));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/comments", commentRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/admin/analytics", adminAnalytics);


app.use(
  session({
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ===== API ROUTES =====
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ===== ADMIN =====
app.use('/api/admin', adminAuthRoutes); // /login /logout /check
app.use('/api/admin', adminRoutes);     // /products

// ===== CONNECT DB & START SERVER =====
const mongoURI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_ATLAS_URI
    : process.env.MONGODB_LOCAL_URI;

console.log('🔌 Using MongoDB:', mongoURI);

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
  });
