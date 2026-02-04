const Product = require('../models/ProductModel');
const Voucher = require('../models/VoucherModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) { if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key)); }
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
  const redirectUrl = process.env.MOMO_REDIRECT_URL || `http://localhost:5173/?payment=success`;
  const ipnUrl = `${process.env.BASE_URL}/api/checkout/momo-ipn`;
  const orderInfo = "Thanh toan don hang " + orderId;
  const requestType = "captureWallet";
  const extraData = "";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode, partnerName: "Store", storeId: "MomoStore",
    requestId, amount, orderId, orderInfo, redirectUrl, ipnUrl,
    lang: 'vi', requestType, autoCapture: true, extraData, signature
  };

  const response = await axios.post(process.env.MOMO_API_URL, requestBody);
  return response.data.payUrl;
};

const createVnpayUrl = (order, req) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = order._id.toString();
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + order._id;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = order.totalAmount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;

  return vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
};

const checkout = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cartItems, paymentMethod = 'cod', voucherCode, shippingAddress, phone, note } = req.body;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập số điện thoại!" });
    }
    if (!shippingAddress || shippingAddress.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập địa chỉ giao hàng!" });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.' });
    }

    const orderItems = [];
    const modified = [];
    
    for (const item of cartItems) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity < 1) {
        for (const m of modified) {
          await Product.findByIdAndUpdate(m._id, { $inc: { quantity: m.qty } });
        }
        return res.status(400).json({ message: 'Item không hợp lệ' });
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );

      if (!product) {
        for (const m of modified) {
          await Product.findByIdAndUpdate(m._id, { $inc: { quantity: m.qty } });
        }
        return res.status(400).json({ message: `Sản phẩm không đủ tồn kho hoặc không tồn tại` });
      }

      modified.push({ _id: product._id, qty: quantity });
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity,
      });
    }

    const subTotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const shippingFee = subTotal > 500000 ? 0 : 30000;

    let discount = 0;
    let voucher = null;
    if (voucherCode) {
      voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), active: true });
      if (!voucher) return res.status(400).json({ message: 'Voucher không hợp lệ' });
      
      const now = new Date();
      if (voucher.validFrom && now < voucher.validFrom) {
        return res.status(400).json({ message: 'Voucher chưa có hiệu lực' });
      }
      if (voucher.validTo && now > voucher.validTo) {
        return res.status(400).json({ message: 'Voucher đã hết hạn' });
      }
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        return res.status(400).json({ message: 'Voucher đã đạt giới hạn sử dụng' });
      }

      if (voucher.discountType === 'percent') {
        discount = Math.round((subTotal * voucher.discountValue) / 100);
      } else {
        discount = voucher.discountValue;
      }

      if (voucher.minOrderValue && subTotal < voucher.minOrderValue) {
        return res.status(400).json({ message: 'Không đạt giá trị tối thiểu để dùng voucher' });
      }

      const user = await User.findById(userId);
      if (user && user.userVouchers) {
        const userVoucherIdx = user.userVouchers.findIndex(
          (uv) => uv.voucherId.toString() === voucher._id.toString()
        );
        if (userVoucherIdx >= 0) {
          if (user.userVouchers[userVoucherIdx].quantity > 0) {
            user.userVouchers[userVoucherIdx].quantity -= 1;
            await user.save();
          } else {
            return res.status(400).json({ message: 'Bạn không còn voucher này' });
          }
        }
      }
    }

    const total = Math.max(0, subTotal + shippingFee - discount);

    const order = await Order.create({
      customerClerkId: userId,
      products: orderItems,
      shippingAddress: shippingAddress,
      totalAmount: total,
      voucherUsed: voucher ? voucher._id : null,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });

    if (voucher) {
      voucher.usedCount = (voucher.usedCount || 0) + 1;
      await voucher.save();
    }

    if (paymentMethod === 'cod') {
      return res.status(201).json({ message: 'Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.', order });
    }

    if (paymentMethod === 'momo') {
      try {
        const payUrl = await createMomoUrl(order);
        return res.status(201).json({ message: 'Đơn hàng đã tạo. Vui lòng thanh toán.', payUrl, order });
      } catch (err) {
        return res.status(500).json({ message: 'Không thể tạo link thanh toán MOMO', error: err.message });
      }
    }

    if (paymentMethod === 'vnpay') {
      try {
        const payUrl = createVnpayUrl(order, req);
        return res.status(201).json({ message: 'Đơn hàng đã tạo. Vui lòng thanh toán.', payUrl, order });
      } catch (err) {
        return res.status(500).json({ message: 'Không thể tạo link thanh toán VNPAY', error: err.message });
      }
    }

    res.status(201).json({ message: 'Đặt hàng thành công', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi thanh toán', error: error.message });
  }
};

const momoNotify = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.body;
    console.log('MOMO IPN:', { orderId, resultCode, message });
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (resultCode == 0) {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        await order.save();
        console.log('Order paid successfully:', orderId);
      }
    } else {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      console.log('Order payment failed:', orderId, message);
      
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
      }
    }
    
    return res.status(204).send();
  } catch (e) {
    console.error('MOMO IPN Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const amount = vnp_Params['vnp_Amount'] / 100;

    if (secureHash !== signed) {
      console.error('Invalid VNPAY signature');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=error&message=Invalid signature`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=error&message=Order not found`);
    }

    if (responseCode === "00") {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        await order.save();
        console.log('VNPAY: Order paid successfully:', orderId);
      }
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=success&orderId=${orderId}&amount=${amount}`);
    }
    
    order.paymentStatus = 'failed';
    order.orderStatus = 'cancelled';
    await order.save();
    console.log('VNPAY: Payment failed:', orderId, responseCode);
    
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
    }
    
    const errorMessages = {
      '07': 'Giao dịch bị nghi ngờ',
      '09': 'Thẻ chưa đăng ký Internet Banking',
      '10': 'Xác thực thất bại',
      '11': 'Hết hạn chờ thanh toán',
      '12': 'Thẻ bị khóa',
      '13': 'Sai mật khẩu',
      '24': 'Hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Vượt quá giới hạn giao dịch',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Nhập sai quá số lần'
    };
    
    const errorMessage = errorMessages[responseCode] || 'Giao dịch thất bại';
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=failed&orderId=${orderId}&message=${encodeURIComponent(errorMessage)}`);
    
  } catch (e) {
    console.error('VNPAY Return Error:', e);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?status=error&message=${encodeURIComponent('Lỗi hệ thống')}`);
  }
};

module.exports = { checkout, momoNotify, vnpayReturn };
