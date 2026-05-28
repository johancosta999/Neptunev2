// const express = require("express");
// const router = express.Router();

// //insert model
// const Water = require("../Model/WaterQuality");

// // import controller
// const WaterQualityController = require("../Controllers/WaterQualityController");

// router.get("/", WaterQualityController.getAllWaterQuality);
// router.post("/:tankId", WaterQualityController.addWaterQuality);

// router.get("/:id", WaterQualityController.getById);
// router.put("/:id", WaterQualityController.updateWaterQuality);
// router.delete("/:id", WaterQualityController.deleteWaterQuality);

// //export
// module.exports = router;

const express = require("express");
const router = express.Router();

// Model & Controller
const WaterQualityModel = require("../Model/WaterQuality");
const WaterQualityController = require("../Controllers/WaterQualityController");

/**
 * GET /api/water-quality
 * Optional: ?tankId=TNK-XXXX -> filter by tank
 * (No tankId => fallback to controller's getAll)
 */
router.get("/", async (req, res, next) => {
  try {
    const { tankId } = req.query;
    if (tankId) {
      const list = await WaterQualityModel.find({ tankId })
        .sort({ timestamp: -1, createdAt: -1 });
      return res.status(200).json({ data: list });
    }
    return WaterQualityController.getAllWaterQuality(req, res, next);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/water-quality/by-tank/:tankId
 * Delete all records for a specific tank (used by UI)
 * (Keep BEFORE "/:id" to avoid route conflicts)
 */
router.delete("/by-tank/:tankId", async (req, res) => {
  try {
    const { tankId } = req.params;
    const result = await WaterQualityModel.deleteMany({ tankId });
    return res.status(200).json({
      ok: true,
      deleted: result.deletedCount || 0,
      tankId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/water-quality
 * ESP32 ingestion (body includes tankId, phLevel, tds, status, timestamp)
 * (Keep legacy POST /:tankId for backward-compat)
 */
router.post("/", WaterQualityController.addWaterQuality);
router.post("/:tankId", WaterQualityController.addWaterQuality);

/**
 * GET /api/water-quality/:id
 * Single record by DB id
 */
router.get("/:id", WaterQualityController.getById);

/**
 * UPDATE /api/water-quality/:id
 */
router.put("/:id", WaterQualityController.updateWaterQuality);
router.patch("/:id", WaterQualityController.updateWaterQuality);

/**
 * DELETE /api/water-quality/:id
 * Single record delete
 */
router.delete("/:id", WaterQualityController.deleteWaterQuality);

module.exports = router;
