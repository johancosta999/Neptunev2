// Backend/Controllers/reportController.js
const Issue = require("../Model/IssueModel");
const WaterLevel = require("../Model/WaterLevel");       // adjust name if your file differs
const WaterQuality = require("../Model/WaterQuality");
const Seller = require("../Model/sellerModel");
const Staff = require("../Model/staffModel");
const User = require("../Model/User");
const { shell, rows, htmlToPdfBuffer } = require("../utils/pdf");

// ---------- Builders for each report ----------
function buildIssueTable(issueDoc) {
  return rows({
    "Tank ID": issueDoc.tankId,
    "Issue Title": issueDoc.title,
    "Description": issueDoc.description,
    "Category": issueDoc.category,
    "Priority": issueDoc.priority,
    "Status": issueDoc.status,
    "Assigned To": issueDoc.assignedTo || "-",
    "Reported Date": new Date(issueDoc.createdAt).toLocaleString(),
    "Attachments": (issueDoc.attachments || []).join(", ") || "-"
  });
}

function buildWaterLevelTable(wl) {
  return rows({
    "Tank ID": wl.tankId,
    "Capacity (L)": wl.capacity,
    "Current Level (L)": wl.currentLevel,
    "Percentage (%)": wl.percentage,
    "Last Measured": new Date(wl.measuredAt || wl.updatedAt || wl.createdAt).toLocaleString(),
    "Alert": wl.alert || "-"
  });
}

function buildWaterQualityTable(wq) {
  return rows({
    "Tank ID": wq.tankId,
    "pH Value": wq.ph,
    "TDS Value": wq.tds,
    "Temperature (°C)": wq.temperature,
    "Last Cleaned": wq.lastCleaned ? new Date(wq.lastCleaned).toLocaleDateString() : "-",
    "Quality Status": wq.status || wq.waterQualityLevel || "-"
  });
}

function buildSellerTable(s) {
  return rows({
    "Seller ID": s.id || s._id,
    "Company Name": s.companyName || s.name || "-",
    "Contact Person": s.contactPerson || "-",
    "Contact Number": s.phone || "-",
    "Email": s.email || "-",
    "Location": s.location || "-",
    "Status": s.status || "Active"
  });
}

function buildStaffTable(st) {
  return rows({
    "Staff ID": st.id || st._id,
    "Name": st.name,
    "Role": st.role,
    "Contact No": st.phone,
    "Email": st.email,
    "Location": st.location,
    "Joined Date": st.createdAt ? new Date(st.createdAt).toLocaleDateString() : "-"
  });
}

function buildUserTable(u) {
  return rows({
    "User ID": u._id,
    "Full Name": u.fullName || u.name || "-",
    "Email": u.email,
    "Phone": u.phone || "-",
    "Tank ID": u.tankId || "-",
    "Address": u.address || "-"
  });
}

// ---------- Controllers ----------
async function issueReport(req, res) {
  try {
    const { tankId, issueId } = req.params;
    const issue = issueId ? await Issue.findById(issueId) : await Issue.findOne({ tankId }).sort({ createdAt: -1 });
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const html = shell("Issue Reporting Detail", buildIssueTable(issue));
    const pdf = await htmlToPdfBuffer(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=issue_${issue._id}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate issue report" });
  }
}

async function waterLevelReport(req, res) {
  try {
    const { tankId } = req.params;
    const wl = await WaterLevel.findOne({ tankId }).sort({ measuredAt: -1 });
    if (!wl) return res.status(404).json({ error: "Water level not found" });

    const html = shell("Water Level Detail Report", buildWaterLevelTable(wl));
    const pdf = await htmlToPdfBuffer(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=water_level_${tankId}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate water level report" });
  }
}

async function waterQualityReport(req, res) {
  try {
    const { tankId } = req.params;
    const wq = await WaterQuality.findOne({ tankId }).sort({ createdAt: -1 });
    if (!wq) return res.status(404).json({ error: "Water quality not found" });

    const html = shell("Water Quality Detail Report", buildWaterQualityTable(wq));
    const pdf = await htmlToPdfBuffer(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=water_quality_${tankId}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate water quality report" });
  }
}

async function sellerReport(req, res) {
  try {
    const { sellerId } = req.params;
    const s = await Seller.findById(sellerId);
    if (!s) return res.status(404).json({ error: "Seller not found" });

    const html = shell("Seller Detail Report", buildSellerTable(s));
    const pdf = await htmlToPdfBuffer(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=seller_${sellerId}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate seller report" });
  }
}

async function staffReport(req, res) {
  try {
    const { staffId } = req.params;
    const st = await Staff.findById(staffId);
    if (!st) return res.status(404).json({ error: "Staff not found" });

    const html = shell("Staff Detail Report", buildStaffTable(st));
    const pdf = await htmlToPdfBuffer(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=staff_${staffId}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate staff report" });
  }
}

async function userReport(req, res) {
  try {
    const { userId } = req.params;
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ error: "User not found" });

    const html = shell("User Detail Report", buildUserTable(u));
    const pdf = await htmlToPdfBuffer(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=user_${userId}.pdf`);
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate user report" });
  }
}

module.exports = {
  issueReport,
  waterLevelReport,
  waterQualityReport,
  sellerReport,
  staffReport,
  userReport
};
