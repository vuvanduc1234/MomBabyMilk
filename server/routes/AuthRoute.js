const express = require("express");
const {
  login,
  register,
  forgetPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  sendResetOTP
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);
router.post("/send-reset-otp", sendResetOTP);

module.exports = router;