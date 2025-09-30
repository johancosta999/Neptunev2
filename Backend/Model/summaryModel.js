// models/summaryModel.js
const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  date: String,
  avgLevel: String,
  counts: Number,
  tankId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Summary", summarySchema);
