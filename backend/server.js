const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ✅ Load env
require('dotenv').config();

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const scanRoutes = require('./routes/scan');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ===== API ROUTES =====
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ===== CHỌN DB THEO NODE_ENV =====
const dbUri =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_ATLAS_URI
    : process.env.MONGODB_LOCAL_URI;

console.log('🔌 Using MongoDB:', dbUri);

// ===== CONNECT MONGODB + START SERVER =====
mongoose
  .connect(dbUri)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));
