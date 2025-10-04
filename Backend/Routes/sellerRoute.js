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
// Profile pic upload
router.post("/:tankId/profile-pic", upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save the file path to DB if needed, but send the URL back
    res.json({
      url: `/uploads/${req.file.filename}`,  // 👈 this is the line
      message: "Profile picture uploaded successfully"
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});



module.exports = router;