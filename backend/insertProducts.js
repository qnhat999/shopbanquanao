// insertProducts.js
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config(); // 👉 Đọc file .env
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopbanquanao';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const data = JSON.parse(fs.readFileSync('./database/products.json', 'utf-8'));

    const formattedData = data.map(p => ({
      ...p,
      image: p.image // hoặc chỉnh sửa nếu image sai folder
    }));

    await Product.deleteMany(); // Xóa cũ
    await Product.insertMany(formattedData);

    console.log('✅ Đã chèn sản phẩm vào MongoDB');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });
