const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const OrderModel = require("../models/OrderModel");
const PointModel = require("../models/PointModel");
const PointHistoryModel = require("../models/PointHistoryModel");
const ProductModel = require("../models/ProductModel");
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
  const { id } = req.params;
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
    // Kiểm tra user tồn tại
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    // VALIDATION: Kiểm tra có orders không (không cho xóa user có đơn hàng)
    const ordersCount = await OrderModel.countDocuments({ customer: id });
    if (ordersCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa người dùng có ${ordersCount} đơn hàng. Vui lòng xử lý đơn hàng trước.`,
        ordersCount: ordersCount,
      });
    }

    // CASCADE 1: Xóa Point record
    await PointModel.deleteOne({ user: id });

    // CASCADE 2: Xóa tất cả PointHistory records
    await PointHistoryModel.deleteMany({ user: id });

    // CASCADE 3: Xóa comments của user từ tất cả products
    await ProductModel.updateMany(
      { "comments.author": id },
      { $pull: { comments: { author: id } } },
    );

    // Xóa user (wishlist và userVouchers embedded sẽ tự động xóa)
    await UserModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa người dùng hoàn tất (đã cleanup points, comments)",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const viewUser = async (req, res) => {
  try {
    const users = await UserModel.find({}).populate(
      "userVouchers.voucherId",
      "code discountPercentage expiryDate",
    );
    if (!users) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res
      .status(200)
      .json({ message: "Hiện thị tất cả người dùng", data: users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getUserVouchers = async (req, res) => {
  try {
    // Tự động lấy từ req.user.id (người đang đăng nhập)
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId).populate(
      "userVouchers.voucherId",
    );
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Lọc voucher hợp lệ (chưa hết hạn)
    const validVouchers = (user.userVouchers || [])
      .filter((uv) => {
        return uv.voucherId && new Date(uv.voucherId.expiryDate) > new Date();
      })
      .map((uv) => ({
        voucherId: uv.voucherId,
        quantity: uv.quantity,
      }));

    if (validVouchers.length === 0) {
      return res.json({
        message: "Bạn chưa sở hữu mã giảm giá nào",
        vouchers: [],
      });
    }

    res.json({ message: "Lấy vouchers thành công", vouchers: validVouchers });
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
  getUserVouchers,
};
