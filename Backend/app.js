const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const sendEmail = require("./Utils/sendEmail");


const waterQualityRoutes = require("./Routes/WaterQualityRoutes");
const Water = require("./Model/WaterQuality");
const WaterlevelRoutes = require("./Routes/WaterLevelRoute");
const WaterLevel = require("./Model/WaterLevelModel");
const sellerRoute = require("./Routes/sellerRoute");
const Seller = require("./Model/sellerModel");
const billingRoutes = require("./Routes/billingRoutes");
const qrRoutes = require("./Routes/qrRoutes");
const summaryRoutes = require("./Routes/summaryRoutes");
const staffRoutes = require("./Routes/staffsRoute");
const staffs = require("./Model/staffModel");
const issueRoutes =require("./Routes/IssueRoutes");

const app = express();

// Middleware
app.use(express.json());
const cors = require("cors");
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files

app.use("/api/issues", issueRoutes);


app.use("/api/waterquality", waterQualityRoutes);
app.use("/api/waterlevel", WaterlevelRoutes);
app.use("/api/sellers", sellerRoute);
app.use("/api/staff", staffRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/bill-summary", summaryRoutes);
app.use("/api/staffs", staffRoutes);

// Connect to MongoDB and start server
mongoose
  .connect("mongodb+srv://admin1:cLp3Hz3s8ElUMOIP@merncluster.8dgv3ew.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));

// ---------------------- Dynamic Tank IDs ----------------------
let tankIds = [];
const lastWaterLevels = {};

// Fetch tank IDs from DB
const fetchTankIds = async () => {
  try {
    const sellers = await Seller.find({}, "tankId");
    tankIds = sellers.map((seller) => seller.tankId);

    // Initialize lastWaterLevels for new tanks
    tankIds.forEach((id) => {
      if (!lastWaterLevels[id]) lastWaterLevels[id] = 100;
    });

    console.log("Tank IDs updated:", tankIds);
  } catch (err) {
    console.error("Error fetching tank IDs:", err);
  }
};

// Fetch immediately and refresh every 5 minutes
fetchTankIds();
setInterval(fetchTankIds, 1 * 60 * 1000);
// ---------------------- Water Quality Generator ----------------------
setInterval(async () => {
  for (const tankId of tankIds) {
    const randomPH = (Math.random() * (8 - 4) + 4).toFixed(2); // 4-8
    const randomTDS = Math.floor(Math.random() * (800 - 100 + 1)) + 100; // 100-800 for more variety
    const status = randomTDS > 500 || randomPH < 5 || randomPH > 8 ? "unsafe" : "safe";

    const record = new Water({
      phLevel: randomPH,
      tds: randomTDS,
      status,
      timestamp: new Date(),
      tankId,
    });

    try {
      await record.save();
      console.log(`✔️ Water quality inserted for ${tankId} at ${new Date().toLocaleTimeString()}`);

      // 🔥 Add email alert logic here
      if (status === "unsafe") {
        try {
          // Find the customer
          const customer = await Seller.findOne({ tankId });
          const measurement = `PH: ${randomPH}, TDS: ${randomTDS}`;

          if (customer?.customerEmail) {
            await sendEmail(
              customer.customerEmail,
              tankId,
              "Below Safe Level",
              measurement
            );
            console.log(
              `📩 Water quality alert sent to customer: ${customer.customerName} (${customer.customerEmail})`
            );
          } else {
            console.log(`⚠️ No customer email for tank ${tankId}`);
          }

          // Always send to admin
          const adminEmail = "johancosta08@gmail.com";
          await sendEmail(adminEmail, tankId, "Below Safe Level", measurement);
          console.log("📩 Water quality alert also sent to admin");
        } catch (emailErr) {
          console.error("❌ Error sending alert email:", emailErr);
        }
      }
    } catch (err) {
      console.error(`❌ Error inserting water quality for ${tankId}:`, err);
    }
  }
}, 15 * 60 * 1000); // every 15 minutes


// ---------------------- Water Level Generator ----------------------
async function generateWaterLevels() {
  for (const tankId of tankIds) {
    let lastLevel = lastWaterLevels[tankId] || 100;

    // Decrease 1-10% each interval
    let decrease = Math.floor(Math.random() * 10) + 1;
    let newLevel = lastLevel - decrease;

    // Reset to 100 if below 20
    if (newLevel < 20) newLevel = 100;

    lastWaterLevels[tankId] = newLevel;

    try {
      const newRecord = new WaterLevel({
        tankId,
        currentLevel: newLevel,
        timestamp: new Date(),
      });
      await newRecord.save();
      console.log(`💧 Water level for ${tankId}: ${newLevel}%`);

      // 🔥 Email alert logic here (same as your controller)
      const maxCapacity = 100; // adjust if you track real capacity
      const percentage = (newLevel / maxCapacity) * 100;
      if (percentage < 25) {
        const customer = await Seller.findOne({ tankId });
        const measurement = `Current Level: ${newLevel}L (${percentage.toFixed(1)}% of ${maxCapacity}L)`;

        if (customer?.customerEmail) {
          await sendEmail(customer.customerEmail, tankId, "Low Water Level", measurement);
          console.log(`📩 Low water level alert sent to ${customer.customerName}`);
        }
        await sendEmail("johancosta08@gmail.com", tankId, "Low Water Level", measurement);
        console.log("📩 Low water level alert sent to admin");
      }

    } catch (err) {
      console.error(`❌ Error saving water level for ${tankId}:`, err);
    }
  }
}


// Run immediately and every 10 minutes
generateWaterLevels();
setInterval(generateWaterLevels, 15 * 60 * 1000);
