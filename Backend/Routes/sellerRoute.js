const express = require("express");
const router = express.Router();

const Seller = require("../Model/sellerModel");


const SellerController = require("../Controllers/sellerControl");
const upload = require("../middleware/uploadProfilePic");


router.get("/", SellerController.getAllSeller);
router.post("/", SellerController.addSeller);
router.get("/:tankId", SellerController.getById);
router.put("/:id", SellerController.updateSeller);
router.delete("/:id", SellerController.deleteSeller);


// Password change route (by tankId)
router.put("/:tankId/password", SellerController.changePassword);


// Profile picture upload route (by tankId)
router.post("/:tankId/profile-pic", upload.single("profilePic"), require("../Controllers/sellerControl").uploadProfilePic);
// Remove profile picture
router.delete("/:tankId/profile-pic", require("../Controllers/sellerControl").removeProfilePic);



module.exports = router;