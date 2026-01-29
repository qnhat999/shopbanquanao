const mongoose = require("mongoose");

const productVisitSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    userId: {
      type: String, // "guest" hoặc userId
      default: "guest"
    },

    visitCount: {
      type: Number,
      default: 1
    },

    lastVisitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Mỗi user chỉ có 1 record cho 1 product
productVisitSchema.index(
  { productId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProductVisit", productVisitSchema);
