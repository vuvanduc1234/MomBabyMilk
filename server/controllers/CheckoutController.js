const Product = require("../models/ProductModel");
const Voucher = require("../models/VoucherModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const mongoose = require("mongoose");
const { addPendingPoints } = require("../services/pointService");
const { createNotification } = require("./NotificationController");

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
      shippingAddress: bodyShippingAddress,
      phone: bodyPhone,
      note,
    } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Validate payment method
    const validPaymentMethods = ["cod", "momo", "vnpay"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      await session.abortTransaction();
      return res.status(400).json({
        message:
          "Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ: cod, momo, vnpay",
      });
    }

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
    let hasPreOrder = false;

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

      if (productFromDB.quantity >= quantity) {
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
          price: product.price,
          quantity,
          imageUrl: Array.isArray(product.imageUrl)
            ? product.imageUrl[0]
            : product.imageUrl,
          isPreOrder: false,
          itemStatus: "available",
        });
      } else if (productFromDB.allowPreOrder) {
        // ✅ FIX 1 & 2: Validate maxPreOrderQuantity TRƯỚC KHI trừ stock
        const availableStock = productFromDB.quantity;
        const preOrderQuantity = quantity - availableStock;

        // Validate giới hạn pre-order trước
        if (preOrderQuantity > productFromDB.maxPreOrderQuantity) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Sản phẩm "${productFromDB.name}" chỉ cho phép đặt trước tối đa ${productFromDB.maxPreOrderQuantity} sản phẩm (bạn đang đặt trước ${preOrderQuantity})`,
          });
        }

        // Xử lý phần có sẵn (nếu có)
        if (availableStock > 0) {
          const product = await Product.findOneAndUpdate(
            { _id: productId, quantity: { $gte: availableStock } },
            { $inc: { quantity: -availableStock } },
            { new: true, session },
          );

          if (!product) {
            await session.abortTransaction();
            return res.status(400).json({
              message: `Không thể xử lý sản phẩm "${productFromDB.name}" do tồn kho thay đổi`,
            });
          }

          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: availableStock,
            imageUrl: Array.isArray(product.imageUrl)
              ? product.imageUrl[0]
              : product.imageUrl,
            isPreOrder: false,
            itemStatus: "available",
          });
        }

        // ✅ FIX 2: Chỉ push pre-order item nếu quantity > 0
        if (preOrderQuantity > 0) {
          orderItems.push({
            product: productFromDB._id,
            name: productFromDB.name,
            price: productFromDB.price,
            quantity: preOrderQuantity,
            imageUrl: Array.isArray(productFromDB.imageUrl)
              ? productFromDB.imageUrl[0]
              : productFromDB.imageUrl,
            isPreOrder: true,
            expectedAvailableDate:
              productFromDB.expectedRestockDate ||
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            itemStatus: "preorder_pending",
          });
          hasPreOrder = true;
        }
      } else {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Sản phẩm ${productFromDB.name} tạm hết hàng và không hỗ trợ đặt trước`,
        });
      }
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

    const total = Math.max(10000, subTotal + shippingFee - discount);

    const allPreOrder = orderItems.every((item) => item.isPreOrder);
    if (allPreOrder && paymentMethod === "cod") {
      await session.abortTransaction();
      return res.status(400).json({
        message:
          "Đơn hàng pre-order phải thanh toán online (MoMo/VNPay), không hỗ trợ COD",
      });
    }

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
          paymentMethod,
          paymentStatus: "pending",
          hasPreOrderItems: hasPreOrder,
          preOrderNote: hasPreOrder
            ? "Đơn hàng có sản phẩm đặt trước. Chúng tôi sẽ giao hàng ngay khi có đủ sản phẩm."
            : null,
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

    // Create notification for order created
    try {
      await createNotification({
        userId: userId,
        type: "order_created",
        title: "Đặt hàng thành công",
        message: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã được tạo. Tổng tiền: ${total.toLocaleString()}đ`,
        orderId: order._id,
        data: {
          orderTotal: total,
          paymentMethod: paymentMethod,
        },
        link: `/track-order`,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    // Thêm pending points cho COD orders
    if (paymentMethod === "cod") {
      try {
        await addPendingPoints(userId, order._id, total);
      } catch (pointError) {
        // Không fail order nếu point service lỗi
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
    res
      .status(500)
      .json({ message: "Lỗi khi thanh toán", error: error.message });
  } finally {
    session.endSession();
  }
};

const momoNotify = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // ✅ FIX 1: Verify MoMo signature
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findById(orderId)
      .populate("customer")
      .session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    // Check idempotency
    if (order.paymentStatus === "paid") {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ message: "Already processed" });
    }

    if (resultCode == 0) {
      // Payment success
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save({ session });

      // ✅ FIX 7: Trừ voucher sau khi payment success
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
          { new: true, session },
        );

        // Remove voucher if quantity = 0
        await User.updateOne(
          { _id: userId },
          { $pull: { userVouchers: { quantity: 0 } } },
          { session },
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Thêm pending points cho online payment
      try {
        await addPendingPoints(userId, order._id, order.totalAmount);
      } catch (pointError) {
        // Silent fail - don't break checkout flow
      }

      return res.status(200).json({ message: "Payment successful" });
    } else {
      // Payment failed - Cho phép user thanh toán lại
      order.paymentStatus = "failed";
      order.orderStatus = "pending_payment"; // Giữ đơn để thanh toán lại
      await order.save({ session });

      // KHÔNG hoàn stock - chỉ hoàn khi user hủy đơn

      await session.commitTransaction();
      session.endSession();

      // Tạo thông báo cho user
      try {
        const userId = order.customer._id || order.customer;
        await createNotification({
          userId: userId,
          type: "payment_failed",
          title: "Thanh toán thất bại",
          message: `Thanh toán đơn hàng #${order._id.toString().slice(-6).toUpperCase()} không thành công. Bạn có thể thanh toán lại hoặc hủy đơn hàng.`,
          orderId: order._id,
          link: "/track-order",
        });
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }

      // Không cần hoàn voucher vì chưa trừ
      return res.status(200).json({ message: "Payment failed" });
    }
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error" });
  }
};

const vnpayReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
      await session.abortTransaction();
      session.endSession();
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Invalid signature`,
      );
    }

    const order = await Order.findById(orderId)
      .populate("customer")
      .session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Order not found`,
      );
    }

    // ✅ FIX 2: Verify amount
    if (Math.abs(paidAmount - order.totalAmount) > 1) {
      await session.abortTransaction();
      session.endSession();
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=Amount mismatch`,
      );
    }

    // Check idempotency
    if (order.paymentStatus === "paid") {
      await session.abortTransaction();
      session.endSession();
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=success&orderId=${orderId}&amount=${paidAmount}`,
      );
    }

    if (responseCode === "00") {
      // Payment success
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save({ session });

      // ✅ FIX 7: Trừ voucher sau khi payment success
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
          { new: true, session },
        );

        // Remove voucher if quantity = 0
        await User.updateOne(
          { _id: userId },
          { $pull: { userVouchers: { quantity: 0 } } },
          { session },
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Thêm pending points cho online payment
      try {
        await addPendingPoints(userId, order._id, order.totalAmount);
      } catch (pointError) {
        // Silent fail - don't break checkout flow
      }

      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=success&orderId=${orderId}&amount=${paidAmount}`,
      );
    }

    // Payment failed - Cho phép user thanh toán lại
    order.paymentStatus = "failed";
    order.orderStatus = "pending_payment"; // Giữ đơn để thanh toán lại
    await order.save({ session });

    // KHÔNG hoàn stock - chỉ hoàn khi user hủy đơn

    await session.commitTransaction();
    session.endSession();

    // Tạo thông báo cho user
    try {
      const userId = order.customer._id || order.customer;
      await createNotification({
        userId: userId,
        type: "payment_failed",
        title: "Thanh toán thất bại",
        message: `Thanh toán đơn hàng #${order._id.toString().slice(-6).toUpperCase()} không thành công. Bạn có thể thanh toán lại hoặc hủy đơn hàng.`,
        orderId: order._id,
        link: "/track-order",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

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
    await session.abortTransaction();
    session.endSession();
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result?status=error&message=${encodeURIComponent("Lỗi hệ thống")}`,
    );
  }
};

module.exports = {
  checkout,
  momoNotify,
  vnpayReturn,
  createMomoUrl,
  createVnpayUrl,
};
