const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://huylmnse181744_db_user:HvqaBt0DKPNwl2Ac@milkshop.zkxc7w1.mongodb.net/MomBabyMilk?appName=MilkShop";

let cachedConnection = null;

const connect = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI);
    cachedConnection = connection;
    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error;
  }
};

const ensureConnection = async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { connect, ensureConnection };
