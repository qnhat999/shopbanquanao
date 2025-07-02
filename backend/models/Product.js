const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  image: { type: String, required: true },
  stock: { type: Number, default: 100 },
  description: String,
  type: { type: String, enum: ['new', 'best', 'sale', 'fashion', 'view'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
