const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders'); // ❗️Chỉ giữ lại products và orders

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ảnh tĩnh từ public/images
app.use('/images', express.static('public/images'));

// Các route API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // ❌ Đã xóa dòng userRoutes

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Luôn bật server, tránh Render bị timeout
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopbanquanao', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));
