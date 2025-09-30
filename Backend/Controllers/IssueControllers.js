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
