const Product = require("../models/ProductModel");
const Voucher = require("../models/VoucherModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const Reward = require("../models/RewardModel");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const mongoose = require("mongoose");
const {
  redeemRewardPoints,
  calculateRewardPoints,
  addRewardPoints,
  getRewardBalance,
} = require("../services/rewardService");

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createMomoUrl = async (order) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const orderId = order._id.toString();
  const requestId = orderId;
  const amount = order.totalAmount.toString();
  // ✅ FIX: Redirect về /payment-result, MoMo sẽ append resultCode
  const redirectUrl =
    process.env.MOMO_REDIRECT_URL ||
    `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result`;
  const ipnUrl = `${process.env.BASE_URL}/api/checkout/momo-ipn`;
  const orderInfo = "Thanh toan don hang " + orderId;
  const requestType = "payWithMethod";
  const extraData = "";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    partnerName: "Store",
    storeId: "MomoStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: "vi",
    requestType,
    autoCapture: true,
    extraData,
    signature,
  };

  const response = await axios.post(process.env.MOMO_API_URL, requestBody);
  return response.data.payUrl;
};

const createVnpayUrl = (order, req) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = order._id.toString();
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang:" + order._id;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = order.totalAmount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  return vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });
};

const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;
    const {
      cartItems,
      paymentMethod = "cod",
      voucherUsed,
      rewardPointsUsed = 0,
      shippingAddress: bodyShippingAddress,
      phone: bodyPhone,
      note,
    } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Load user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const phone = bodyPhone || (user.phone ? String(user.phone) : null);
    const shippingAddress = bodyShippingAddress || user.address;

    // Validate input
    if (!phone || phone.trim() === "") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại hoặc cập nhật trong profile!",
      });
    }
    if (!shippingAddress || shippingAddress.trim() === "") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Vui lòng nhập địa chỉ giao hàng hoặc cập nhật trong profile!",
      });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.",
      });
    }

    // ✅ FIX 3: Validate giá từ DB thay vì tin frontend
    const productIds = cartItems.map((item) => item.productId);
    const productsFromDB = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    if (productsFromDB.length !== cartItems.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Một số sản phẩm không tồn tại" });
    }

    const orderItems = [];

    // ✅ FIX 4: Atomic stock deduction với transaction
    for (const item of cartItems) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity < 1) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Item không hợp lệ" });
      }

      // Get price from DB (not from frontend)
      const productFromDB = productsFromDB.find(
        (p) => p._id.toString() === productId,
      );
      if (!productFromDB) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Sản phẩm không tồn tại" });
      }

      // Atomic stock update
      const product = await Product.findOneAndUpdate(
        { _id: productId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true, session },
      );

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Sản phẩm "${productFromDB.name}" không đủ tồn kho`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // Use DB price, not frontend
        quantity,
      });
    }

    // Calculate subtotal
    const subTotal = orderItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    );
    const shippingFee = subTotal > 500000 ? 0 : 30000;

    let discount = 0;
    let voucher = null;

    // ✅ FIX 6 & 7: Validate voucher (không trừ nếu online payment)
    if (voucherUsed) {
      try {
        voucher = await Voucher.findById(voucherUsed).session(session);
      } catch (err) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Voucher ID không hợp lệ" });
      }

      if (!voucher || !voucher.isActive) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Voucher không hợp lệ hoặc không còn hoạt động",
        });
      }

      const now = new Date();
      if (voucher.expiryDate && now > new Date(voucher.expiryDate)) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Voucher đã hết hạn" });
      }

      if (voucher.minOrderValue && subTotal < voucher.minOrderValue) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ để dùng voucher này`,
        });
      }

      // Check user có voucher này không
      const userVoucherIdx = user.userVouchers?.findIndex(
        (uv) => uv.voucherId.toString() === voucher._id.toString(),
      );

      if (userVoucherIdx === undefined || userVoucherIdx < 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Bạn không sở hữu voucher này" });
      }

      if (user.userVouchers[userVoucherIdx].quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Bạn không còn voucher này" });
      }

      discount = Math.round((subTotal * voucher.discountPercentage) / 100);

      // ✅ FIX 7: Chỉ trừ voucher nếu COD
      if (paymentMethod === "cod") {
        // ✅ FIX 6: Atomic voucher deduction
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: userId,
            "userVouchers.voucherId": voucher._id,
            "userVouchers.quantity": { $gt: 0 },
          },
          {
            $inc: { "userVouchers.$.quantity": -1 },
          },
          { new: true, session },
        );

        if (!updatedUser) {
          await session.abortTransaction();
          return res.status(400).json({ message: "Không thể sử dụng voucher" });
        }

        // Remove voucher if quantity = 0
        await User.updateOne(
          { _id: userId },
          { $pull: { userVouchers: { quantity: 0 } } },
          { session },
        );
      }
    }

    // ✅ FIX 5 & 7: Validate points với giới hạn 50% (không trừ nếu online payment)
    let rewardDiscount = 0;
    if (rewardPointsUsed > 0) {
      const afterVoucher = subTotal - discount;
      const maxPointsUsable = Math.floor(afterVoucher * 0.5); // 50% max

      if (rewardPointsUsed > maxPointsUsable) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Bạn chỉ có thể sử dụng tối đa ${maxPointsUsable} xu (50% giá trị đơn hàng sau giảm giá)`,
        });
      }

      const userBalance = await getRewardBalance(userId);
      if (rewardPointsUsed > userBalance) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Bạn chỉ có ${userBalance} xu, không đủ để sử dụng ${rewardPointsUsed} xu`,
        });
      }

      rewardDiscount = rewardPointsUsed;

      // ✅ FIX 7: Chỉ trừ xu nếu COD
      if (paymentMethod === "cod") {
        const reward = await Reward.findOneAndUpdate(
          { user: userId, balance: { $gte: rewardPointsUsed } },
          {
            $inc: { balance: -rewardPointsUsed },
            $push: {
              transactions: {
                type: "redeem",
                amount: rewardPointsUsed,
                reason: "Sử dụng xu thanh toán đơn hàng (COD)",
                meta: { orderTemp: "pending" },
              },
            },
          },
          { new: true, session },
        );

        if (!reward) {
          await session.abortTransaction();
          return res.status(400).json({ message: "Không thể sử dụng xu" });
        }
      }
    }

    const total = Math.max(
      10000,
      subTotal + shippingFee - discount - rewardDiscount,
    );
    const rewardPointsEarned = calculateRewardPoints(total);

    // Create Order
    const orderDoc = await Order.create(
      [
        {
          customer: userId,
          cartItems: orderItems,
          shippingAddress: shippingAddress,
          phone: phone,
          note: note || "",
          totalAmount: total,
          voucherUsed: voucher ? voucher._id : null,
          rewardPointsUsed: rewardPointsUsed || 0,
          rewardPointsEarned,
          paymentMethod,
          paymentStatus: "pending",
          // ✅ FIX: Online payment chỉ là pending_payment, chưa phải order thực sự
          orderStatus:
            paymentMethod === "cod" ? "processing" : "pending_payment",
        },
      ],
      { session },
    );

    const order = orderDoc[0];

    // ✅ FIX 4: Commit transaction trước khi return
    await session.commitTransaction();

    // COD: cộng xu ngay
    if (paymentMethod === "cod") {
      if (order.rewardPointsEarned > 0) {
        await addRewardPoints(
          userId,
          order.rewardPointsEarned,
          "Mua hàng thành công (COD)",
          { orderId: order._id },
        );
      }

      return res.status(201).json({
        message: "Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.",
        order,
      });
    }

    // Online payment: generate payment URL
    if (paymentMethod === "momo") {
      try {
        const payUrl = await createMomoUrl(order);
        return res.status(201).json({
          message: "Đơn hàng đã tạo. Vui lòng thanh toán.",
          payUrl,
          order,
        });
      } catch (err) {
        return res.status(500).json({
          message: "Không thể tạo link thanh toán MOMO",
          error: err.message,
        });
      }
    }

    if (paymentMethod === "vnpay") {
      try {
        const payUrl = createVnpayUrl(order, req);
        return res.status(201).json({
          message: "Đơn hàng đã tạo. Vui lòng thanh toán.",
          payUrl,
          order,
        });
      } catch (err) {
        return res.status(500).json({
          message: "Không thể tạo link thanh toán VNPAY",
          error: err.message,
        });
      }
    }

    res.status(201).json({ message: "Đặt hàng thành công", order });
  } catch (error) {
    await session.abortTransaction();
    console.error("Checkout error:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi thanh toán", error: error.message });
  } finally {
    session.endSession();
  }
};

const momoNotify = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    console.log("MOMO IPN:", { orderId, resultCode, message, transId });

    // ✅ FIX 1: Verify MoMo signature
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid MoMo signature", {
        orderId,
        signature,
        expectedSignature,
      });
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findById(orderId).populate("customer");
    if (!order) {
      console.error("Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Check idempotency
    if (order.paymentStatus === "paid") {
      console.log("Order already paid:", orderId);
      return res.status(200).json({ message: "Already processed" });
    }

    if (resultCode == 0) {
      // Payment success
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save();

      // ✅ FIX 7: Trừ voucher & points sau khi payment success
      const userId = order.customer._id || order.customer;

      // Trừ voucher atomic
      if (order.voucherUsed) {
        await User.findOneAndUpdate(
          {
            _id: userId,
            "userVouchers.voucherId": order.voucherUsed,
            "userVouchers.quantity": { $gt: 0 },
          },
          {
            $inc: { "userVouchers.$.quantity": -1 },
          },
          { new: true },
        );

        // Remove voucher if quantity = 0
        await User.updateOne(
          { _id: userId },
          { $pull: { userVouchers: { quantity: 0 } } },
        );
      }

      // Trừ points atomic
      if (order.rewardPointsUsed > 0) {
        await Reward.findOneAndUpdate(
          { user: userId, balance: { $gte: order.rewardPointsUsed } },
          {
            $inc: { balance: -order.rewardPointsUsed },
            $push: {
              transactions: {
                type: "redeem",
                amount: order.rewardPointsUsed,
                reason: "Sử dụng xu thanh toán đơn hàng (MoMo)",
                meta: { orderId: order._id, transId },
              },
            },
          },
          { new: true },
        );
      }

      // Cộng earned points
      if (order.rewardPointsEarned > 0) {
        await addRewardPoints(
          userId,
          order.rewardPointsEarned,
          "Mua hàng thành công (MoMo)",
          { orderId: order._id, transId },
        );
      }

      console.log("Order paid successfully:", orderId);
      return res.status(200).json({ message: "Payment successful" });
    } else {
      // Payment failed
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      await order.save();

      console.log("Order payment failed:", orderId, message);

      // Refund stock
      for (const item of order.cartItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      }

      // Không cần hoàn voucher/points vì chưa trừ
      return res.status(200).json({ message: "Payment failed" });
    }
  } catch (e) {
    console.error("MOMO IPN Error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const paidAmount = parseInt(vnp_Params["vnp_Amount"]) / 100;
    const transactionNo = vnp_Params["vnp_TransactionNo"];

    // Verify signature
    if (secureHash !== signed) {
      console.error("Invalid VNPAY signature");
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Invalid signature`,
      );
    }

    const order = await Order.findById(orderId).populate("customer");
    if (!order) {
      console.error("Order not found:", orderId);
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Order not found`,
      );
    }

    // ✅ FIX 2: Verify amount
    if (Math.abs(paidAmount - order.totalAmount) > 1) {
      console.error("Amount mismatch", {
        orderId,
        paidAmount,
        expectedAmount: order.totalAmount,
      });
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Amount mismatch`,
      );
    }

    // Check idempotency
    if (order.paymentStatus === "paid") {
      console.log("VNPAY: Order already paid:", orderId);
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=success&orderId=${orderId}&amount=${paidAmount}`,
      );
    }

    if (responseCode === "00") {
      // Payment success
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save();

      // ✅ FIX 7: Trừ voucher & points sau khi payment success
      const userId = order.customer._id || order.customer;

      // Trừ voucher atomic
      if (order.voucherUsed) {
        await User.findOneAndUpdate(
          {
            _id: userId,
            "userVouchers.voucherId": order.voucherUsed,
            "userVouchers.quantity": { $gt: 0 },
          },
          {
            $inc: { "userVouchers.$.quantity": -1 },
          },
          { new: true },
        );

        // Remove voucher if quantity = 0
        await User.updateOne(
          { _id: userId },
          { $pull: { userVouchers: { quantity: 0 } } },
        );
      }

      // Trừ points atomic
      if (order.rewardPointsUsed > 0) {
        await Reward.findOneAndUpdate(
          { user: userId, balance: { $gte: order.rewardPointsUsed } },
          {
            $inc: { balance: -order.rewardPointsUsed },
            $push: {
              transactions: {
                type: "redeem",
                amount: order.rewardPointsUsed,
                reason: "Sử dụng xu thanh toán đơn hàng (VNPay)",
                meta: { orderId: order._id, transactionNo },
              },
            },
          },
          { new: true },
        );
      }

      // Cộng earned points
      if (order.rewardPointsEarned > 0) {
        await addRewardPoints(
          userId,
          order.rewardPointsEarned,
          "Mua hàng thành công (VNPay)",
          { orderId: order._id, transactionNo },
        );
      }

      console.log("VNPAY: Order paid successfully:", orderId);
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=success&orderId=${orderId}&amount=${paidAmount}`,
      );
    }

    // Payment failed
    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    await order.save();

    console.log("VNPAY: Payment failed:", orderId, responseCode);

    // Refund stock
    for (const item of order.cartItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    // Không cần hoàn voucher/points vì chưa trừ

    const errorMessages = {
      "07": "Giao dịch bị nghi ngờ",
      "09": "Thẻ chưa đăng ký Internet Banking",
      10: "Xác thực thất bại",
      11: "Hết hạn chờ thanh toán",
      12: "Thẻ bị khóa",
      13: "Sai mật khẩu",
      24: "Hủy giao dịch",
      51: "Tài khoản không đủ số dư",
      65: "Vượt quá giới hạn giao dịch",
      75: "Ngân hàng đang bảo trì",
      79: "Nhập sai quá số lần",
    };

    const errorMessage = errorMessages[responseCode] || "Giao dịch thất bại";
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=failed&orderId=${orderId}&message=${encodeURIComponent(errorMessage)}`,
    );
  } catch (e) {
    console.error("VNPAY Return Error:", e);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=${encodeURIComponent("Lỗi hệ thống")}`,
    );
  }
};

module.exports = { checkout, momoNotify, vnpayReturn };
