// testWaterQualityEmail.js
const sendEmail = require("./sendEmail");

async function testWaterQualityEmail() {
  try {
    console.log("🧪 Testing water quality email...");
    
    // Test with sample data
    const testEmail = "johancosta421@gmail.com";
    const tankId = "TANK001";
    const status = "Below Safe Level";
    const measurement = "PH: 4.2, TDS: 650";
    
    await sendEmail(testEmail, tankId, status, measurement);
    console.log("✅ Test email sent successfully!");
    
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
}

// Run the test
testWaterQualityEmail();
