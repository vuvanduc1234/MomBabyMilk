const mongoose = require("mongoose");
const user = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      unique: true,
      required: true,
      type: Number,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      required: true,
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      required: true,
      type: Date,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "StaffManager", "User"],
      default: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String, 
    emailVerificationExpires: Date, 

    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.models.User || mongoose.model("User", user);
