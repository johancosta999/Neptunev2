const express = require("express");
const Offer = require("../Model/Offer");
const Product = require("../Model/Product");
const router = express.Router();

// Compute status for each offer
function withStatus(o) {
  const now = new Date();
  const start = new Date(o.startDate);
  const end = new Date(o.endDate);
  let status = "Inactive";
  if (o.active) {
    if (now < start) status = "Scheduled";
    else if (now > end) status = "Expired";
    else status = "Active";
  }
  return { ...o.toObject(), status };
}

// List offers (optionally filter by q or status)
router.get("/", async (req, res) => {
  try {
    const { q, status } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { code:  new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }
    const docs = await Offer.find(filter)
      .populate({ path: "productIds", select: "name sku" })
      .sort({ createdAt: -1 });

    // status is derived
    const enriched = docs.map(withStatus);
    const filtered = status ? enriched.filter((o) => o.status.toLowerCase() === status.toLowerCase()) : enriched;

    res.json(filtered);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch offers" });
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const {
      title, code, description, discountType, amount,
      startDate, endDate, active, productIds = [], usageLimit = 0
    } = req.body;

    // validate products exist
    if (productIds?.length) {
      const exists = await Product.find({ _id: { $in: productIds } }).countDocuments();
      if (exists !== productIds.length) {
        return res.status(400).json({ message: "Some products not found" });
      }
    }

    const created = await Offer.create({
      title, code: String(code).toUpperCase().trim(), description,
      discountType, amount, startDate, endDate, active, productIds, usageLimit
    });

    const populated = await Offer.findById(created._id).populate("productIds", "name sku");
    res.status(201).json(withStatus(populated));
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || "Failed to create offer" });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.code) payload.code = String(payload.code).toUpperCase().trim();

    const updated = await Offer.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate("productIds", "name sku");
    res.json(withStatus(updated));
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Failed to update offer" });
  }
});

// Toggle active
router.patch("/:id/toggle", async (req, res) => {
  try {
    const doc = await Offer.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Offer not found" });
    doc.active = !doc.active;
    await doc.save();
    const populated = await Offer.findById(doc._id).populate("productIds", "name sku");
    res.json(withStatus(populated));
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Failed to toggle offer" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Failed to delete offer" });
  }
});

module.exports = router;