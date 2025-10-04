const express = require("express");
const router = express.Router();

//insert model
const Water = require("../Model/WaterQuality");

// import controller
const WaterQualityController = require("../Controllers/WaterQualityController");

router.get("/", WaterQualityController.getAllWaterQuality);
router.post("/:tankId", WaterQualityController.addWaterQuality);

router.get("/:id", WaterQualityController.getById);
router.put("/:id", WaterQualityController.updateWaterQuality);
router.delete("/:id", WaterQualityController.deleteWaterQuality);

//export
module.exports = router;