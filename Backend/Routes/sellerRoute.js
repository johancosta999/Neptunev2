const express = require("express");
const router = express.Router();

const Seller = require("../Model/sellerModel");

const SellerController = require("../Controllers/sellerControl");

router.get("/", SellerController.getAllSeller);
router.post("/", SellerController.addSeller);
router.get("/:tankId", SellerController.getById);
router.put("/:id", SellerController.updateSeller);
router.delete("/:id", SellerController.deleteSeller);




module.exports = router;