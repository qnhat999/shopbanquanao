const mongoose = require("mongoose");

const UserVectorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["guest", "returning"], default: "guest" },

  behavioral: {
    dwellTime: { type: Number, default: 0 },
    scrollDepth: { type: Number, default: 0 },
    heartbeatCount: { type: Number, default: 0 }
  },

  psychological: {
    sentimentScore: { type: Number, default: 0 }
  },

  historical: {
    recency: Number,
    frequency: Number,
    monetary: Number
  },

  combinedVector: [Number],

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserVector", UserVectorSchema);
