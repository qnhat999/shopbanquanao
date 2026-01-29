const mongoose = require("mongoose");

const ProductViewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  userId: {
    type: String,
    default: "guest"
  },

  timeSpent: {
    type: Number,
    required: true
  },

  sessionId: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("ProductView", ProductViewSchema);
