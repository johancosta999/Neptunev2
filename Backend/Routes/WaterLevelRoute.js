const express = require("express");
const router = express.Router();

//insert Model
const levelModel = require("../Model/WaterLevelModel");

//insert controller
const WaterLevelControl = require("../Controllers/WaterLevelControl");

router.get("/", WaterLevelControl.getallWaterlevel);
router.post("/:id", WaterLevelControl.addWaterLevel);
router.get("/:id", WaterLevelControl.getById);
router.put("/:id", WaterLevelControl.updateWaterLevel);
router.delete("/:id", WaterLevelControl.deleteWaterRecord);




//export
module.exports = router;
