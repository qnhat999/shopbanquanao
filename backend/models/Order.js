const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  image: String,
  quantity: Number,
  userName: String,
  userPhone: String,
  confirmed: { type: Boolean, default: false } // ✅ Thêm field này
});

module.exports = mongoose.model('Order', OrderSchema);
