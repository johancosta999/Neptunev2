const Issue = require("../Model/IssueModel");

// Create a new issue
exports.createIssue = async (req, res) => {
  try {
    const files = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const issue = new Issue({
      ...req.body,
      attachments: files
    });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all issues for a tank
exports.getMyIssues = async (req, res) => {
  try {
    const tankId = req.query.tankId; // frontend can send ?tankId=T001
    const issues = await Issue.find({ tankId }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single issue by ID
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an issue
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign technician and update status
exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { assignedTo: technicianId, status: "Assigned In Progress" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Issue not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// List recent open/unassigned issues for notifications
exports.getOpenIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ status: { $in: ["Open"] } })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark issue as resolved
exports.resolveIssue = async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Issue not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};