const Billing = require("../Model/Billing");
const { get } = require("../Routes/billingRoutes");

//1.Create a normal bill
const createBill = async (req, res) => {
  try {
    const bill = new Billing(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
//2. Create a bill based on calculated usage
const createCalculatedBill = async (req, res) => {
  try {
    const { userId, currentReading, pricePerUnit, waterQualityLevel, month } =
      req.body;

    const lastBill = await Billing.findOne({ userId }).sort({ createdAt: 1 });
    const previousReading = lastBill ? lastBill.currentReading : 0;

    const usage = currentReading - previousReading;
    if (usage < 0) {
      return res
        .status(400)
        .json({
          error: "Current reading cannot be less than previous reading.",
        });
    }

    const totalBill = usage * pricePerUnit;

    const bill = new Billing({
      userId,
      month,
      currentReading,
      previousReading,
      usageInLiters: usage,
      pricePerUnit,
      waterQualityLevel,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ eroor: err.message });
  }
};

//3.Get all bills
const getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get a single billing record by ID
const getBillingById = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!bill)
      return res.status(404).json({ message: "Billing record not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//4. Get bills by user
const getBillsByUser = async (req, res) => {
  try {
    const bills = await Billing.find({ userId: req.params.userId });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ erorr: err.message });
  }
};

//5. Update a bill
const updateBill = async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//6.Delete a bill
const deleteBill = async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createBill,
  createCalculatedBill,
  getAllBills,
  getBillsByUser,
  updateBill,
  deleteBill,
  getBillingById,
};
