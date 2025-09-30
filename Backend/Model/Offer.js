const mongoose = require("mongoose");
const { Schema } = mongoose;

const OfferSchema = new Schema(
  {
    title: { type: String, required: true },
    code:  { type: String, required: true, unique: true, index: true }, // e.g. NEW10
    description: { type: String, default: "" },

    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    amount: { type: Number, required: true }, // 10 (% or $) depending on type

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    active: { type: Boolean, default: true },       // on/off switch
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }], // applies to these products

    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    timesUsed:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);