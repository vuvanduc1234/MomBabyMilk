const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Staff", "User"],
      default: "User",
    },
    userVouchers: [
      {
        _id: false,
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
        quantity: { type: Number, default: 1 },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: { type: String },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
