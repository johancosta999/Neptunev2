const WaterLevelModel = require("../Model/WaterLevelModel");
const Waterlevel = require("../Model/WaterLevelModel");
const sendEmail = require("../Utils/sendEmail");

const getallWaterlevel = async (req, res, next) => {
  const { tankId } = req.query;

  try {
    let data;
    if (tankId) {
      data = await WaterLevelModel.find({ tankId: tankId });
    } else {
      data = await WaterLevelModel.find();
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No water level records found." });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


//insert data
const addWaterLevel = async (req, res, next) => {
  const { tankId, currentLevel, maxCapacity, location, status, recordedAt, userEmail } =
    req.body;

  try {
    const newRecord = new Waterlevel({
      tankId,
      currentLevel,
      maxCapacity,
      location,
      status,
      recordedAt: recordedAt || new Date(),
    });
    await newRecord.save();

    // 🔹 Send alert if water level is below 25%
    const percentage = (currentLevel / maxCapacity) * 100;
    if (percentage < 25) {
      const subject = `🚨 Low Water Level Alert for Tank ${tankId}`;
      const message = `URGENT: Low Water Level Alert!\n\nTank ID: ${tankId}\nCurrent Level: ${currentLevel}L\nMax Capacity: ${maxCapacity}L\nPercentage: ${percentage.toFixed(1)}%\nLocation: ${location || 'Not specified'}\nTime: ${new Date().toLocaleString()}\n\nWater level is critically low. Please refill the tank immediately.`;
      
      // Send email to admin and user if provided
      const adminEmail = "johancosta08@gmail.com"; // Admin email
      try {
        await sendEmail(adminEmail, subject, message);
        console.log("✅ Low water level alert email sent to admin");
        
        if (userEmail && userEmail !== adminEmail) {
          await sendEmail(userEmail, subject, message);
          console.log("✅ Low water level alert email sent to user");
        }
      } catch (emailError) {
        console.error("❌ Error sending low water level alert email:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json(newRecord);
  } catch (err) {
    console.error("Error adding water level record:", err);
    res.status(500).json({ message: err.message });
  }
};
//get ById
const getById = async(req , res, next) =>{
  const id = req.params.id;

  let record;
  try {
    record = await WaterLevelModel.findById(id);
  } catch (err) {
    console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "No water quality data found for that ID." });
  }
  return res.status(200).json({ record });
  

};
// Update Record
const updateWaterLevel = async (req, res, next) => {
  const id = req.params.id;
  const {  currentLevel,maxCapacity,status } = req.body;

  let record;
  try {
    record = await WaterLevelModel.findByIdAndUpdate(id, {
      currentLevel,
      maxCapacity,
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
//Delete Record
const deleteWaterRecord = async (req, res, next) => {
  const id = req.params.id;

  let record;
  try {
    record = await WaterLevelModel.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "Cannot delete. Data not found." });
  }
  return res.status(200).json({ message: "Water quality data deleted successfully." });
};

exports.getallWaterlevel = getallWaterlevel;
exports.addWaterLevel = addWaterLevel;
exports.getById = getById;
exports.updateWaterLevel = updateWaterLevel;
exports.deleteWaterRecord = deleteWaterRecord;

