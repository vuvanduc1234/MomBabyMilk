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
      status: 201,
      message: "Tạo người dùng thành công",
    });
  } catch (err) {
    console.log(err);
  }
};

const findById = async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  try {
    if (user) {
      res.json({
        status: 200,
        message: "Tìm người dùng theo ID thành công",
        data: user,
      });
    } else {
      res.json({
        status: 400,
        message: "Lỗi tìm người dùng theo ID",
        data: [],
      });
    }
  } catch (err) {
    console.log(err);
  }
};
const updateUser = async (req, res) => {
  try {
    const allowedFields = [
      "fullname",
      "phone",
      "gender",
      "address",
      "dateOfBirth",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

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
        data: [],
      });
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Không tìm thấy người dùng",
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Cập nhật hoàn tất",
      data: user,
    });
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({
        status: 200,
        message: "Xóa hoàn tất",
        data: user,
      });
    } else {
      res.json({
        status: 400,
        message: "Lỗi xóa người dùng",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const viewUser = async (req, res) => {
  const user = await UserModel.find({});
  try {
    res.send(user);
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  updateUser,
  deleteUser,
  viewUser,
  findById,
  createUser,
};
