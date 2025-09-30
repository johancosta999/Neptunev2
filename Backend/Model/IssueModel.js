const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  tankId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Water Quality", "Low Level", "Sensor Error", "Billing", "Other"], default: "Other" },
  priority: { type: String, enum: ["Low", "Normal", "High", "Critical"], default: "Normal" },
  status: { type: String, default: "Open" },
  attachments: [String],
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);
