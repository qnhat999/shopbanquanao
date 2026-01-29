const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  userId: {
    type: String // ✅ đổi ObjectId → String
  },
  content: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CommentSchema.index({ productId: 1 });
CommentSchema.index({ sentiment: 1 });

module.exports = mongoose.model("Comment", CommentSchema);
