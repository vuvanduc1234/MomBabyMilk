const VoucherModel = require("../models/VoucherModel");
const UserVoucherModel = require("../models/UserVoucherModel");
const UserModel = require("../models/UserModel");


const generateRandomCode = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


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

    
    const userVoucher = await UserVoucherModel.findOne({ userId, voucherId });

    if (userVoucher) {
      
      userVoucher.quantity += qtyToAdd;
      await userVoucher.save();
    } else {
      
      await UserVoucherModel.create({ userId, voucherId, quantity: qtyToAdd });
    }

    res.status(200).json({ message: `Đã gửi ${qtyToAdd} voucher cho user thành công` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const assignVoucherToAll = async (req, res) => {
  const { voucherId, quantity } = req.body;
  const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

  try {
    const voucher = await VoucherModel.findById(voucherId);
    if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });

    if (new Date(voucher.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Voucher này đã hết hạn" });
    }

    const allUsers = await UserModel.find({});
    
    
    const bulkOps = allUsers.map(user => ({
      updateOne: {
        filter: { userId: user._id, voucherId: voucherId },
        update: { $inc: { quantity: qtyToAdd } }, 
        upsert: true 
      }
    }));

    if (bulkOps.length > 0) {
      await UserVoucherModel.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: `Đã gửi ${qtyToAdd} voucher thành công cho ${allUsers.length} người dùng` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getMyVouchers = async (req, res) => {
  const userId = req.user.id || req.user._id; 

  try {
    
    const myVouchers = await UserVoucherModel.find({ userId, quantity: { $gt: 0 } })
      .populate("voucherId"); 

    
    const validVouchers = myVouchers.filter(item => {
        if (!item.voucherId) return false;
        return new Date(item.voucherId.expiryDate) > new Date(); 
    });

    res.status(200).json({ message: "Kho voucher của bạn", data: validVouchers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const applyVoucher = async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { code, orderTotal } = req.body; 
  
    if (!code || !orderTotal) {
      return res.status(400).json({ message: "Thiếu mã voucher hoặc tổng tiền đơn hàng" });
    }
  
    try {
      
      const voucher = await VoucherModel.findOne({ code: code.toUpperCase(), isActive: true });
      if (!voucher) {
        return res.status(404).json({ message: "Voucher không tồn tại hoặc đã bị khóa" });
      }
  
      
      if (new Date(voucher.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Voucher đã hết hạn" });
      }
  
      
      if (orderTotal < voucher.minOrderValue) {
        return res.status(400).json({ 
          message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ mới được áp dụng` 
        });
      }
  
      
      const userVoucher = await UserVoucherModel.findOne({ userId, voucherId: voucher._id });
  
      if (!userVoucher || userVoucher.quantity <= 0) {
        return res.status(400).json({ message: "Bạn không sở hữu voucher này hoặc đã dùng hết lượt" });
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