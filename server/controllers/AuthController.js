const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const {
  sendResetPassword,
  sendVerificationEmail,
} = require("../config/mailer");
const {
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  replaceRefreshToken,
} = require("../services/tokenService");
const UserModel = require("../models/UserModel");

const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;
const isStrongPassword = (pw) => PW_REGEX.test(pw);
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
    }

    const userRecord = await User.findOne({ email }).select("+password");
    if (!userRecord) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác" });
    }

    const valid = await bcrypt.compare(password, userRecord.password);
    if (!valid) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác" });
    }

    const user = {
      id: userRecord._id,
      email: userRecord.email,
      name: userRecord.fullname,
    };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    await saveRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await removeRefreshToken(refreshToken);
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const token = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Không có token" });

    const stored = await findRefreshToken(refreshToken);
    if (!stored) return res.status(403).json({ error: "Token không hợp lệ" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, user) => {
        if (err) return res.status(403).json({ error: "Token không hợp lệ" });

        try {
          const newRefreshToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" },
          );
          await replaceRefreshToken(user.id, refreshToken, newRefreshToken);

          const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
          });
          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
          });
          res.json({ accessToken });
        } catch (error) {
          console.error("Lỗi làm mới token:", error);
          res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
        }
      },
    );
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const register = async (req, res) => {
  const { email, password, fullname, role } =
    req.body;

  if (!email || !password || !fullname) {
    return res.status(400).json({
      message:
        "Vui lòng cung cấp email, mật khẩu, họ tên",
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Mật khẩu phải có 8-30 ký tự, bao gồm chữ hoa, chữ thường và số (khuyến nghị từ 12 ký tự trở lên)",
    });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (user && user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email đã được đăng ký và xác thực" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newUserDetails = {
      email,
      password: hashedPassword,
      fullname,
      role,
      isVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpires,
    };

    if (user) {
      await UserModel.updateOne({ _id: user._id }, newUserDetails);
    } else {
      await UserModel.create(newUserDetails);
    }

    await sendVerificationEmail(email, otp, fullname);

    res.status(201).json({
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực tài khoản",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi mã để đặt lại mật khẩu",
      });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000;

    user.passwordResetToken = otp;
    user.passwordResetExpires = otpExpires;
    await sendResetPassword(email, otp);
    await user.save();

    res.status(200).json({
      message:
        "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi mã để đặt lại mật khẩu",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp mã token và mật khẩu mới" });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message:
        "Mật khẩu phải có 8-30 ký tự, bao gồm chữ hoa, chữ thường và số (khuyến nghị từ 12 ký tự trở lên)",
    });
  }

  try {
    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Cập nhật mật khẩu hoàn tất" });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Vui lòng cung cấp email, mật khẩu cũ và mật khẩu mới",
    });
  }

  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json({ message: "Mật khẩu mới phải khác mật khẩu cũ" });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message:
        "Mật khẩu phải có 8-30 ký tự, bao gồm chữ hoa, chữ thường và số (khuyến nghị từ 12 ký tự trở lên)",
    });
  }

  try {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy người dùng" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Cập nhật mật khẩu hoàn tất" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp email và mã OTP" });
  }

  try {
    const user = await UserModel.findOne({
      email,
      emailVerificationToken: otp,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      name: user.fullname,
    });

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, name: user.fullname },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    await saveRefreshToken(user._id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Xác thực email thành công!",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ message: "Yêu cầu nhập email" });
  }

  try {
    const user = await UserModel.findOne({email});
    if (!user) {
      return res.json({message: "Không tìm thấy người dùng"})
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000;
    user.emailVerificationToken =  otp;
    user.emailVerificationExpires = otpExpires;
    await sendVerificationEmail(email, otp, user.fullname)
    await user.save();
    res.status(200).json({message: "Gửi OTP Thành công"})
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  login,
  logout,
  token,
  register,
  forgetPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  sendResetOTP
};
