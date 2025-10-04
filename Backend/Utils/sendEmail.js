const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "johancosta08@gmail.com",          // replace with your Gmail
        pass: "notshowing",            // replace with Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Water Monitoring System" <johancosta08@gmail.com>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

module.exports = sendEmail;
