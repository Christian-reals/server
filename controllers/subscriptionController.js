const { Seller } = require("../models/seller");
const Subscription = require("../models/subscriptionModel");

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create(req.body);
    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("package")
      .populate("seller")
      .populate("transaction");
    res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Get a single subscription by ID
const getSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }
    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a subscription by ID
const updateSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a subscription by ID
const deleteSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    const subscription = await Subscription.findByIdAndDelete(subscriptionId);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllActiveSubscriptions = async (req, res) => {
  try {
    // Find all active subscriptions where the expiryDate is greater than the current date
    const subscriptions = await Subscription.find({
      expiryDate: { $gte: new Date() },
    }).populate('seller package transaction');

    res.json({ subscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving active subscriptions',error });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
  getAllActiveSubscriptions
};
