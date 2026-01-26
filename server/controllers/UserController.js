const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;
const isStrongPassword = (pw) => PW_REGEX.test(pw);
const createUser = async (req, res) => {
  try {
    const { email, password, fullname, phone, role, gender, dateOfBirth } =
      req.body;
    if (!email || !password || !fullname || !phone || !gender || !dateOfBirth) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp email, mật khẩu, họ tên, số điện thoại, giới tính và ngày sinh",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Mật khẩu phải có 8-30 ký tự, bao gồm chữ hoa, chữ thường và số",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      fullname,
      phone,
      role: role || "User",
      gender,
      dateOfBirth,
      isVerified: true,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Tạo người dùng thành công",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const findById = async (req, res) => {
  const {id} = req.params
  try {
    const user = await UserModel.findById(id);
    if (user) {
      res.status(200).json({
        message: "Tìm người dùng theo ID thành công",
        data: user,
      });
    } else {
      res.status(404).json({
        message: "Lỗi tìm người dùng theo ID",
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (
      req.body.role ||
      req.body.password ||
      req.body.isVerified ||
      req.body.email
    ) {
      return res.status(403).json({
        status: 403,
        message:
          "Không thể cập nhật các trường bảo vệ (role, password, isVerified, email)",
      });
    }

    const user = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    return res.status(200).json({
      message: "Cập nhật người dùng hoàn tất",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({
        message: "Xóa người dùng hoàn tất",
        data: user,
      });
    } else {
      res.status(404).json({
        message: "Lỗi xóa người dùng",
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const viewUser = async (req, res) => {
  try {
    const user = await UserModel.find({});
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ message: "Hiện thị tất cả người dùng", data: user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};
module.exports = {
  updateUser,
  deleteUser,
  viewUser,
  findById,
  createUser,
};
