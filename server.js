const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== STATIC FILES =====
// Ảnh sản phẩm
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Frontend
app.use(express.static(path.join(__dirname, 'public')));

// ===== API ROUTES =====
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scan', require('./routes/scan'));
app.use('/api/chatbot', require('./routes/chatbot'));

// ===== FALLBACK (SPA) =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== CONNECT MONGODB + START SERVER =====
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopbanquanao')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));
