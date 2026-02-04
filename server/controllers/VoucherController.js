const VoucherModel = require("../models/VoucherModel");
const UserModel = require("../models/UserModel");

// Hàm tạo mã ngẫu nhiên
const generateRandomCode = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// 1. TẠO VOUCHER THỦ CÔNG
const createManualVoucher = async (req, res) => {
  const { code, discountPercentage, description, expiryDate, minOrderValue } = req.body;

  if (!code || !discountPercentage || !expiryDate) {
    return res.status(400).json({ message: "Vui lòng nhập mã, % giảm giá và ngày hết hạn" });
  }

  try {
    const existingVoucher = await VoucherModel.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }

    const newVoucher = await VoucherModel.create({
      code,
      discountPercentage,
      description,
      expiryDate,
      minOrderValue: minOrderValue || 0, 
    });

    res.status(201).json({ message: "Tạo voucher thành công", data: newVoucher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. TẠO VOUCHER NGẪU NHIÊN
const createRandomVoucher = async (req, res) => {
  const { discountPercentage, description, expiryDate, minOrderValue } = req.body;

  if (!discountPercentage || !expiryDate) {
    return res.status(400).json({ message: "Vui lòng nhập % giảm giá và ngày hết hạn" });
  }

  try {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = "VOUCHER" + generateRandomCode(6); 
      const exist = await VoucherModel.findOne({ code });
      if (!exist) isUnique = true;
    }

    const newVoucher = await VoucherModel.create({
      code,
      discountPercentage,
      description,
      expiryDate,
      minOrderValue: minOrderValue || 0,
    });

    res.status(201).json({ message: "Tạo voucher random thành công", data: newVoucher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. TẶNG VOUCHER CHO 1 USER
const assignVoucherToUser = async (req, res) => {
  const { voucherId, userId, quantity } = req.body;
  const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

  try {
    const voucher = await VoucherModel.findById(voucherId);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
    
    if (new Date(voucher.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Voucher này đã hết hạn" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Kiểm tra xem user đã có voucher này chưa
    const existingVoucherIdx = user.userVouchers.findIndex(
      uv => uv.voucherId.toString() === voucherId.toString()
    );

    if (existingVoucherIdx >= 0) {
      // Nếu đã có, tăng quantity
      user.userVouchers[existingVoucherIdx].quantity += qtyToAdd;
    } else {
      // Nếu chưa có, thêm mới
      user.userVouchers.push({ voucherId, quantity: qtyToAdd });
    }

    await user.save();

    res.status(200).json({ message: `Đã gửi ${qtyToAdd} voucher cho user thành công` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. TẶNG VOUCHER CHO TẤT CẢ USER
const assignVoucherToAll = async (req, res) => {
  const { voucherId, quantity } = req.body;
  const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

  try {
    const voucher = await VoucherModel.findById(voucherId);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });

    if (new Date(voucher.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Voucher này đã hết hạn" });
    }

    // Lấy tất cả users
    const users = await UserModel.find({});
    
    // Update từng user
    for (const user of users) {
      const existingVoucherIdx = user.userVouchers.findIndex(
        uv => uv.voucherId.toString() === voucherId.toString()
      );

      if (existingVoucherIdx >= 0) {
        user.userVouchers[existingVoucherIdx].quantity += qtyToAdd;
      } else {
        user.userVouchers.push({ voucherId, quantity: qtyToAdd });
      }

      await user.save();
    }

    res.status(200).json({ message: `Đã gửi ${qtyToAdd} voucher thành công cho tất cả người dùng` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. LẤY VOUCHER CỦA TÔI (DEPRECATED - dùng GET /api/users/my-vouchers)
const getMyVouchers = async (req, res) => {
  const userId = req.user.id || req.user._id; 

  try {
    const user = await UserModel.findById(userId).populate("userVouchers.voucherId");
    
    if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Lọc ra các voucher chưa hết hạn với quantity
    const validVouchers = (user.userVouchers || []).filter(uv => {
        return uv.voucherId && new Date(uv.voucherId.expiryDate) > new Date(); 
    });

    if (validVouchers.length === 0) {
      return res.status(200).json({ message: "Bạn chưa sở hữu mã giảm giá nào", data: [] });
    }

    res.status(200).json({ message: "Kho voucher của bạn", data: validVouchers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. KIỂM TRA/ÁP DỤNG VOUCHER (Validate)
const applyVoucher = async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { code, orderTotal } = req.body; 
  
    if (!code || !orderTotal) {
      return res.status(400).json({ message: "Thiếu mã voucher hoặc tổng tiền đơn hàng" });
    }
  
    try {
      // Tìm voucher trong hệ thống
      const voucher = await VoucherModel.findOne({ code: code.toUpperCase(), isActive: true });
      if (!voucher) {
        return res.status(404).json({ message: "Voucher không tồn tại hoặc đã bị khóa" });
      }
  
      // Kiểm tra hạn sử dụng
      if (new Date(voucher.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Voucher đã hết hạn" });
      }
  
      // Kiểm tra giá trị đơn hàng tối thiểu
      if (orderTotal < voucher.minOrderValue) {
        return res.status(400).json({ 
          message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ mới được áp dụng` 
        });
      }
  
      // KIỂM TRA SỞ HỮU: User có voucher này trong userVouchers không?
      const user = await UserModel.findById(userId);
      const userVoucher = (user.userVouchers || []).find(
        uv => uv.voucherId.toString() === voucher._id.toString()
      );
  
      if (!userVoucher || userVoucher.quantity <= 0) {
        return res.status(400).json({ message: "Bạn không sở hữu voucher này hoặc đã hết lượt sử dụng" });
      }
  
      const discountAmount = (orderTotal * voucher.discountPercentage) / 100;
  
      res.status(200).json({
        message: "Áp dụng voucher thành công",
        data: {
          voucherId: voucher._id,
          code: voucher.code,
          discountPercentage: voucher.discountPercentage,
          discountAmount: discountAmount,
          finalPrice: orderTotal - discountAmount
        }
      });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

module.exports = {
  createManualVoucher,
  createRandomVoucher,
  assignVoucherToUser,
  assignVoucherToAll,
  getMyVouchers,
  applyVoucher 
};