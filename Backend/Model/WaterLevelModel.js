const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waterLevelSchema = new Schema({
  tankId: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: Number, // in litters
    required: true,
  },
  location: { type: String },
  maxCapacity: { type: Number },

  status: {
    type: String,
    default: "Normal",
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("WaterLevelModel", waterLevelSchema);
