// sendEmail-gmail.js
const nodemailer = require("nodemailer");

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "johancosta08@gmail.com",
    pass: "vird mmll qfdk kpnm", // your App Password from Google
  },
});

/**
 * Send professional water quality email
 * @param {string} to - recipient email
 * @param {string} tankId - tank number/id
 * @param {string} status - current status (e.g., "Below Safe Level", "Normal")
 * @param {string|number} measurement - current water quality measurement
 */
async function sendEmail(to, tankId, status, measurement) {
  try {
    // Generate dynamic subject
    const subject = `[ALERT] Tank ${tankId} Water Quality: ${status}`;

    // Generate professional HTML content
    const htmlContent = `
      <h2>⚠️ Water Tank Alert</h2>
      <p>Hello Team,</p>
      <p><b>Tank:</b> ${tankId}</p>
      <p><b>Status:</b> <span style="color:${status === "Normal" ? "green" : "red"}">${status}</span></p>
      <p><b>Current Measurement:</b> ${measurement}</p>
      <p><b>Recommended Actions:</b></p>
      <ul>
        ${status !== "Normal" ? "<li>Check water filtration system</li><li>Review tank usage logs</li><li>Notify maintenance team if necessary</li>" : "<li>No action required</li>"}
      </ul>
      <p><b>Timestamp:</b> ${new Date().toLocaleString()}</p>
      <p>— Water Monitoring System</p>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: '"Water Monitoring System" <johancosta08@gmail.com>',
      to,
      subject,
      html: htmlContent, // send HTML version
      text: `Tank ${tankId} Water Quality Alert: ${status}. Measurement: ${measurement}`, // fallback text
    });

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ Send failed:", err);
    throw err;
  }
}

module.exports = sendEmail;
