const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createIssue, getMyIssues, getIssue, deleteIssue, assignTechnician, getOpenIssues, resolveIssue } = require("../Controllers/IssueControllers");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir); } catch {}
}

// File upload setup with basic filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const allowed = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only image and video files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

// Routes
router.post("/", upload.array("attachments", 5), createIssue);
router.get("/mine", getMyIssues);
router.get("/open", getOpenIssues);
router.get("/:id", getIssue);
router.patch("/:id/assign", assignTechnician);
router.patch("/:id/resolve", resolveIssue);
router.delete("/:id", deleteIssue);

module.exports = router;
