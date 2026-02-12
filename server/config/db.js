const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://huylmnse181744_db_user:HvqaBt0DKPNwl2Ac@milkshop.zkxc7w1.mongodb.net/MomBabyMilk?appName=MilkShop";

// Cache connection cho Vercel serverless
let cachedConnection = null;

const connect = async () => {
  // Nếu đã có connection và đang connected, reuse
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Tạo connection mới với options tối ưu cho serverless
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout nếu không kết nối được trong 5s
      socketTimeoutMS: 45000, // Timeout cho các operations
    });

    cachedConnection = connection;
    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error;
  }
};

// Middleware để đảm bảo connection ready trước khi xử lý request
const ensureConnection = async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = { connect, ensureConnection };
