const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  month: {
    type: String,
    required: true,
  },

  previousReading: {
    type: Number,
    required: true,
  },

  usageInLiters: {
    type: Number,
    required: true,
  },

  pricePerUnit: {
    type: Number,
    required: true,
  },

  totalBill: {
    type: Number,
    required: true,
  },

  waterQualityLevel: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Poor"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Billing", billingSchema);
