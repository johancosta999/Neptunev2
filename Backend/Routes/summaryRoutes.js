const express = require("express");
const router = express.Router();
const summaryController = require("../Controllers/summarycontroller");

// Already exists
router.post("/:tankId", summaryController.saveWeeklySummary);

// ✅ Add this to fix the GET 404 issue
router.get("/:tankId", summaryController.getWeeklySummary);


module.exports = router;
