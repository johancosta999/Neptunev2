const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    serialNumber: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true }, // e.g., "Tanks", "Filters", "Sensors"
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // served as /uploads/filename.ext
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);