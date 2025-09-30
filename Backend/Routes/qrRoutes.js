const express = require("express");
const router = express.Router();
const {generateUserQR} = require("../Controllers/qrController");

router.get("/:userId", generateUserQR);

module.exports = router;