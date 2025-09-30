// controllers/summaryController.js
const Summary = require("../Model/summaryModel"); // Make sure this is correct!

const saveWeeklySummary = async (req, res) => {
  try {
    const summaries = req.body; // expects an array of summaries
    const { tankId } = req.params;

    if (!Array.isArray(summaries)) {
      return res.status(400).json({ message: "Data should be an array." });
    }

    // Attach tankId to each summary
    const summariesWithTankId = summaries.map((summary) => ({
      ...summary,
      tankId,
    }));

    const saved = await Summary.insertMany(summariesWithTankId);
    res.status(200).json({ message: "Summary saved!", data: saved });
  } catch (err) {
    console.error("Error saving summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id);

    if (!summary) {
      return res.status(404).json({ message: "Summary not found." });
    }

    res.status(200).json({ data: summary });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};



const getWeeklySummary = async (req, res) => {
  const { tankId } = req.params;

  try {
    const summaries = await Summary.find({ tankId });
    res.status(200).json({ data: summaries });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Server error while fetching summary" });
  }
};

module.exports = {
  saveWeeklySummary,  // already defined
  getWeeklySummary    // ✅ export this too
};




