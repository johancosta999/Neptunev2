const WaterQuality = require("../Model/WaterQuality");
const axios = require('axios');
const sendEmail = require("../Utils/sendEmail");

const getAllWaterQuality = async (req, res, next) => {
  const { tankId } = req.query;  // get tankId from query

  let data;
  try {
    if (tankId) {
      data = await WaterQuality.find({ tankId: tankId });
    } else {
      data = await WaterQuality.find(); // fallback: return all
    }
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const getById = async (req, res, next) => {
  const id = req.params.id;
  let record;
  try {
    record = await WaterQuality.findById(id);
  } catch (err) {
    console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "No water quality data found for that ID." });
  }
  return res.status(200).json({ record });
};

const sendWhatsAppMessage = async (phoneNumber, message) => {
  const url = 'https://graph.facebook.com/v13.0/YOUR_PHONE_NUMBER_ID/messages';
  const data = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    text: { body: message },
  };
  const headers = {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const addWaterQuality = async (req, res, next) => {
  // get tankId either from body OR params
  const tankId = req.body.tankId || req.params.tankId;

  const { phLevel, tds, status, timestamp, userEmail } = req.body;

  // Validate required fields
  if (!tankId || phLevel === undefined || tds === undefined || !status) {
    return res.status(400).json({ 
      message: "Missing required fields. Please provide tankId, phLevel, tds, and status." 
    });
  }

  // Validate data types and ranges
  if (typeof phLevel !== 'number' || phLevel < 0 || phLevel > 14) {
    return res.status(400).json({ 
      message: "PH Level must be a number between 0 and 14." 
    });
  }

  if (typeof tds !== 'number' || tds < 0 || tds > 1000) {
    return res.status(400).json({ 
      message: "TDS must be a number between 0 and 1000." 
    });
  }

  if (!['Safe', 'Unsafe', 'safe', 'unsafe'].includes(status)) {
    return res.status(400).json({ 
      message: "Status must be either 'Safe' or 'Unsafe'." 
    });
  }

  try {
    const newRecord = new WaterQuality({
      tankId,
      phLevel,
      tds,
      status,
      timestamp: timestamp || new Date(),
    });
    await newRecord.save();

    // 🔹 Send alert if status is unsafe
    if (status.toLowerCase() === "unsafe") {
      const subject = `⚠️ Water Quality Alert for Tank ${tankId}`;
      const message = `URGENT: Water Quality Alert!\n\nTank ID: ${tankId}\nStatus: ${status}\nPH Level: ${phLevel}\nTDS: ${tds}\nTime: ${new Date().toLocaleString()}\n\nPlease take immediate action to address the water quality issue.`;
      
      // Send email to admin and user if provided
      const adminEmail = "johancosta08@gmail.com"; // Admin email
      try {
        await sendEmail(adminEmail, subject, message);
        console.log("✅ Water quality alert email sent to admin");
        
        if (userEmail && userEmail !== adminEmail) {
          await sendEmail(userEmail, subject, message);
          console.log("✅ Water quality alert email sent to user");
        }
      } catch (emailError) {
        console.error("❌ Error sending water quality alert email:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json(newRecord);
  } catch (err) {
    console.error("Error adding water quality record:", err);
    res.status(500).json({ message: err.message });
  }
};




const updateWaterQuality = async (req, res, next) => {
  const id = req.params.id;
  const { phLevel, tds, status } = req.body;

  let record;
  try {
    record = await WaterQuality.findByIdAndUpdate(id, {
      phLevel,
      tds,
      status
    }, { new: true });
  } catch (err) {
    console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "Cannot update. Data not found." });
  }
  return res.status(200).json({ record });
};


const deleteWaterQuality = async (req, res, next) => {
  const id = req.params.id;

  let record;
  try {
    record = await WaterQuality.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "Cannot delete. Data not found." });
  }
  return res.status(200).json({ message: "Water quality data deleted successfully." });
};

// exports
exports.getAllWaterQuality = getAllWaterQuality;
exports.getById = getById;
exports.addWaterQuality = addWaterQuality;
exports.updateWaterQuality = updateWaterQuality;
exports.deleteWaterQuality = deleteWaterQuality;
