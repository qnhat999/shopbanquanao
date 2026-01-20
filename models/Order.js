const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    confirmed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
