const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createIssue, getMyIssues, getIssue, deleteIssue } = require("../Controllers/IssueControllers");

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
router.post("/", upload.array("attachments", 5), createIssue);
router.get("/mine", getMyIssues);
router.get("/:id", getIssue);
router.delete("/:id", deleteIssue);

module.exports = router;
