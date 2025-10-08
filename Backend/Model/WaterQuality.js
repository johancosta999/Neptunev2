const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const waterQualitySchema = new Schema({
  tankId: { type: String,
    required: true },

  phLevel: {
    type: Number,
    required: true,
  },
  tds: {
    type: Number,
    required: true,
  },
  salinity: {
    type: Number,
    required: true,
  },
  ecValue: {
    type: Number,
    required: true,
  },
  turbidity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WaterQuality", waterQualitySchema);
