# 📚 PHÂN TÍCH BACKEND - CHECKOUT CONTROLLER

## 🎯 Dành cho sinh viên lập trình Web - Payment Integration & Transaction

---

## 1. 📌 ĐOẠN CODE NÀY LÀ GÌ?

```javascript
// File: server/controllers/CheckoutController.js
const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;
    const { cartItems, paymentMethod, voucherUsed, shippingAddress, phone } = req.body;

    // Validate & create order
    const order = await Order.create([{ ... }], { session });
    await session.commitTransaction();

    if (paymentMethod === 'momo') {
      const payUrl = await createMomoUrl(order);
      return res.json({ payUrl, order });
    }
    // ...
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
```

### 📍 Thuộc phần nào của hệ thống?

- **Loại**: **CONTROLLER** (Business Logic)
- **Vị trí**: `server/controllers/CheckoutController.js`
- **Vai trò**: Xử lý checkout, tích hợp payment gateway (MoMo, VNPay)

### 🎯 Mục đích chính

1. **Xử lý checkout**: Tạo đơn hàng, trừ tồn kho, tính toán giá
2. **Payment Gateway Integration**: Kết nối MoMo/VNPay
3. **Transaction Management**: Đảm bảo dữ liệu nhất quán
4. **Webhook Handling**: Xử lý callback từ payment gateway

---

## 2. ❓ TẠI SAO PHẢI DÙNG NÓ?

### 🚨 Nếu KHÔNG có Transaction, hệ thống sẽ gặp vấn đề gì?

#### Vấn đề 1: **Race Condition - Overselling**

```javascript
// ❌ KHÔNG CÓ TRANSACTION
const checkout = async (req, res) => {
  const product = await Product.findById(productId);

  if (product.quantity >= 10) {
    // ⚠️ CÓ THỂ BỊ RACE CONDITION TẠI ĐÂY!
    // Giữa lúc kiểm tra và lúc update, có thể có request khác cũng đang xử lý

    await Product.updateOne({ _id: productId }, { $inc: { quantity: -10 } });
    await Order.create({ ... });
  }
};

// KỊ BẢN:
// Request 1: Check stock = 15 → OK → Trừ 10
// Request 2: Check stock = 15 → OK → Trừ 10
// Kết quả: Stock = -5 (Overselling!)
```

**Giải pháp:**

```javascript
// ✅ CÓ TRANSACTION + ATOMIC UPDATE
const session = await mongoose.startSession();
session.startTransaction();

const product = await Product.findOneAndUpdate(
  { _id: productId, quantity: { $gte: 10 } }, // Atomic check & update
  { $inc: { quantity: -10 } },
  { new: true, session },
);

if (!product) {
  await session.abortTransaction();
  return res.status(400).json({ message: "Không đủ tồn kho" });
}

await session.commitTransaction();
```

#### Vấn đề 2: **Partial Updates (Dữ liệu không nhất quán)**

```javascript
// ❌ KHÔNG CÓ TRANSACTION
const checkout = async (req, res) => {
  await Product.updateOne({ _id: productId }, { $inc: { quantity: -10 } }); // ✓ Thành công
  await Order.create({ userId, productId, quantity: 10 }); // ✓ Thành công
  await User.updateOne({ _id: userId }, { $inc: { "vouchers.$.quantity": -1 } }); // ❌ LỖI!

  // Kết quả: Stock đã trừ, Order đã tạo, nhưng voucher KHÔNG trừ → Không nhất quán!
};

// ✅ CÓ TRANSACTION
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Product.updateOne({ ... }, { session });
  await Order.create([{ ... }], { session });
  await User.updateOne({ ... }, { session });

  await session.commitTransaction(); // Tất cả hoặc không thay đổi gì
} catch (error) {
  await session.abortTransaction(); // Rollback tất cả
}
```

### 💡 Nó giải quyết bài toán gì trong thực tế?

| Bài toán                    | Giải pháp                                 |
| --------------------------- | ----------------------------------------- |
| **Overselling**             | Atomic update + Transaction               |
| **Payment Integration**     | Webhook handling + Signature verification |
| **Double Spending Voucher** | Atomic voucher deduction                  |
| **Pre-order validation**    | Business logic validation                 |
| **Concurrent requests**     | Database-level locking                    |

---

## 3. ⏰ KHI NÀO DÙNG NÓ?

### ✅ LUÔN dùng Transaction khi:

1. **Update nhiều collection** (Product + Order + User)
2. **Critical business logic** (payment, inventory)
3. **Race condition risk** (concurrent requests)

### ❌ KHÔNG cần Transaction khi:

1. **Đọc dữ liệu** (GET requests)
2. **Update 1 document đơn giản** (update profile name)
3. **Không có dependency** giữa các operations

---

## 4. 🏗️ DÙNG NÓ Ở ĐÂU TRONG DỰ ÁN?

### 🎯 Luồng Checkout trong kiến trúc

```
┌────────────────────────────────────────────────┐
│  CLIENT (React)                                │
│  - CheckoutPage.jsx                            │
│  - CartContext.jsx                             │
└──────────────┬─────────────────────────────────┘
               │ POST /api/checkout
               │ { cartItems, paymentMethod, ... }
               ▼
┌────────────────────────────────────────────────┐
│  MIDDLEWARE                                    │
│  - authenticateToken()                         │
│    ✓ Verify JWT                                │
│    ✓ req.user = { id, role }                   │
└──────────────┬─────────────────────────────────┘
               │ next()
               ▼
┌────────────────────────────────────────────────┐
│  CONTROLLER - checkout()                       │
│  1. Start transaction                          │
│  2. Validate input                             │
│  3. Check product stock (atomic)               │
│  4. Calculate total + voucher                  │
│  5. Create order                               │
│  6. Commit transaction                         │
│  7. Generate payment URL (if online)           │
└──────────────┬─────────────────────────────────┘
               │
               ├─ COD → Return order
               │
               ├─ MoMo → createMomoUrl()
               │         │
               │         ▼
               │   ┌──────────────────────────┐
               │   │  MOMO SERVER             │
               │   │  User thanh toán         │
               │   └──────┬───────────────────┘
               │          │ IPN Callback
               │          ▼
               │   POST /api/checkout/momo-ipn
               │   momoNotify()
               │   ✓ Verify signature
               │   ✓ Update order status
               │   ✓ Deduct voucher
               │
               └─ VNPay → createVnpayUrl()
                         │
                         ▼
                   ┌──────────────────────────┐
                   │  VNPAY SERVER            │
                   │  User thanh toán         │
                   └──────┬───────────────────┘
                          │ Return URL
                          ▼
                   GET /api/checkout/vnpay-return
                   vnpayReturn()
                   ✓ Verify secure hash
                   ✓ Update order status
                   ✓ Redirect to /payment-result
```

---

## 5. ⚙️ NÓ HOẠT ĐỘNG NHƯ THẾ NÀO?

### 📖 Phân tích từng bước

#### Bước 1: **Start Transaction**

```javascript
const session = await mongoose.startSession();
session.startTransaction();
```

**Giải thích:**

- `startSession()`: Tạo một session MongoDB
- `startTransaction()`: Bắt đầu transaction
- Tất cả operations sau đây phải dùng `{ session }` option

**Transaction trong MongoDB:**

```
BEGIN TRANSACTION
  ↓
[Operation 1] → Pending
  ↓
[Operation 2] → Pending
  ↓
[Operation 3] → Pending
  ↓
COMMIT → Tất cả thay đổi được áp dụng
(hoặc ABORT → Tất cả thay đổi bị hủy)
```

#### Bước 2: **Validate Input**

```javascript
const userId = req.user?.id;
const {
  cartItems,
  paymentMethod = "cod",
  voucherUsed,
  shippingAddress,
  phone,
} = req.body;

if (!userId) return res.status(401).json({ message: "Unauthorized" });

const validPaymentMethods = ["cod", "momo", "vnpay"];
if (!validPaymentMethods.includes(paymentMethod)) {
  await session.abortTransaction();
  return res
    .status(400)
    .json({ message: "Phương thức thanh toán không hợp lệ" });
}
```

**Tại sao phải validate?**

- Chặn invalid data sớm (trước khi DB operations)
- Tránh lãng phí resources
- Bảo mật: Không tin tưởng frontend data

#### Bước 3: **Check Stock & Validate Price (Atomic)**

```javascript
const productIds = cartItems.map((item) => item.productId);
const productsFromDB = await Product.find({ _id: { $in: productIds } }).session(
  session,
);

for (const item of cartItems) {
  const productFromDB = productsFromDB.find(
    (p) => p._id.toString() === item.productId,
  );

  // ❌ KHÔNG dùng giá từ frontend
  // const price = item.price; // Nguy hiểm! User có thể sửa thành 1đ

  // ✅ Luôn lấy giá từ DB
  const price = productFromDB.price;

  // Atomic stock update
  const product = await Product.findOneAndUpdate(
    { _id: productId, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true, session },
  );

  if (!product) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Không đủ tồn kho" });
  }
}
```

**Atomic Update:**

```javascript
// ❌ NON-ATOMIC (Race condition)
const product = await Product.findById(id);
if (product.quantity >= 10) {
  // ← NGUY HIỂM: Giữa check và update có thể có request khác
  await Product.updateOne({ _id: id }, { $inc: { quantity: -10 } });
}

// ✅ ATOMIC (No race condition)
const product = await Product.findOneAndUpdate(
  { _id: id, quantity: { $gte: 10 } }, // Check & update trong 1 query
  { $inc: { quantity: -10 } },
  { new: true },
);
```

#### Bước 4: **Calculate Total + Voucher**

```javascript
const subTotal = orderItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
const shippingFee = subTotal > 500000 ? 0 : 30000;

let discount = 0;
if (voucherUsed) {
  const voucher = await Voucher.findById(voucherUsed).session(session);

  // Validate voucher
  if (!voucher || !voucher.isActive) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Voucher không hợp lệ" });
  }

  // Check expiry
  if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Voucher đã hết hạn" });
  }

  // Check min order value
  if (voucher.minOrderValue && subTotal < voucher.minOrderValue) {
    await session.abortTransaction();
    return res.status(400).json({
      message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}đ`,
    });
  }

  discount = Math.round((subTotal * voucher.discountPercentage) / 100);

  // ⚠️ CHỈ trừ voucher cho COD (online payment trừ sau khi thanh toán thành công)
  if (paymentMethod === "cod") {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "userVouchers.voucherId": voucher._id,
        "userVouchers.quantity": { $gt: 0 },
      },
      { $inc: { "userVouchers.$.quantity": -1 } },
      { new: true, session },
    );

    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Không thể sử dụng voucher" });
    }
  }
}

const total = Math.max(10000, subTotal + shippingFee - discount);
```

**Tại sao không trừ voucher ngay cho online payment?**

- User có thể **không thanh toán** (đóng cửa sổ payment)
- Nếu trừ ngay → User **mất voucher nhưng không mua được hàng**
- → Trừ voucher **sau khi thanh toán thành công** trong `momoNotify()` / `vnpayReturn()`

#### Bước 5: **Create Order**

```javascript
const orderDoc = await Order.create(
  [
    {
      customer: userId,
      cartItems: orderItems,
      shippingAddress: shippingAddress,
      phone: phone,
      totalAmount: total,
      voucherUsed: voucher ? voucher._id : null,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: paymentMethod === "cod" ? "processing" : "pending_payment",
      // COD → processing (đơn hàng được xác nhận)
      // Online → pending_payment (chờ thanh toán)
    },
  ],
  { session },
);

const order = orderDoc[0];
```

#### Bước 6: **Commit Transaction**

```javascript
await session.commitTransaction();
// ✓ Tất cả thay đổi được áp dụng vào DB
// Product stock đã trừ
// Order đã tạo
// Voucher đã trừ (nếu COD)
```

#### Bước 7: **Generate Payment URL (if online)**

```javascript
if (paymentMethod === "momo") {
  const payUrl = await createMomoUrl(order);
  return res.status(201).json({ payUrl, order });
}

if (paymentMethod === "vnpay") {
  const payUrl = createVnpayUrl(order, req);
  return res.status(201).json({ payUrl, order });
}
```

---

## 6. 💳 PAYMENT GATEWAY INTEGRATION

### 🔵 MoMo Integration

#### **createMomoUrl()**

```javascript
const createMomoUrl = async (order) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const orderId = order._id.toString();
  const amount = order.totalAmount.toString();
  const redirectUrl = `${process.env.CLIENT_URL}/payment-result`;
  const ipnUrl = `${process.env.BASE_URL}/api/checkout/momo-ipn`;
  const orderInfo = "Thanh toan don hang " + orderId;

  // Tạo signature (bảo mật)
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=payWithMethod`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    orderId,
    amount,
    orderInfo,
    redirectUrl,
    ipnUrl,
    signature,
    // ...
  };

  const response = await axios.post(process.env.MOMO_API_URL, requestBody);
  return response.data.payUrl;
  // → https://test-payment.momo.vn/v2/gateway/pay?...
};
```

**Giải thích:**

- **Signature**: HMAC-SHA256 để verify request không bị giả mạo
- **redirectUrl**: URL redirect user sau khi thanh toán (frontend)
- **ipnUrl**: URL MoMo gọi để thông báo kết quả (backend webhook)

#### **momoNotify() - Webhook Handler**

```javascript
const momoNotify = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, resultCode, signature, ... } = req.body;

    // 1. VERIFY SIGNATURE (Bảo mật)
    const secretKey = process.env.MOMO_SECRET_KEY;
    const rawSignature = `accessKey=...&amount=...&orderId=${orderId}&...`;
    const expectedSignature = crypto.createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 2. FIND ORDER
    const order = await Order.findById(orderId).populate("customer").session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // 3. CHECK IDEMPOTENCY (Tránh xử lý 2 lần)
    if (order.paymentStatus === "paid") {
      await session.abortTransaction();
      return res.status(200).json({ message: "Already processed" });
    }

    // 4. UPDATE ORDER STATUS
    if (resultCode == 0) { // Thanh toán thành công
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save({ session });

      // Trừ voucher (nếu có)
      if (order.voucherUsed) {
        await User.findOneAndUpdate(
          { _id: order.customer, "userVouchers.voucherId": order.voucherUsed },
          { $inc: { "userVouchers.$.quantity": -1 } },
          { session }
        );
      }

      // Add pending points
      await addPendingPoints(order.customer, order._id, order.totalAmount);

      await session.commitTransaction();
      return res.status(200).json({ message: "Payment successful" });
    } else { // Thanh toán thất bại
      order.paymentStatus = "failed";
      order.orderStatus = "pending_payment"; // Cho phép thanh toán lại
      await order.save({ session });

      // KHÔNG hoàn stock (user có thể thanh toán lại)
      // Chỉ hoàn stock khi user HỦY đơn

      await session.commitTransaction();
      return res.status(200).json({ message: "Payment failed" });
    }
  } catch (e) {
    await session.abortTransaction();
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
```

### 🟢 VNPay Integration

#### **vnpayReturn() - Return URL Handler**

```javascript
const vnpayReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];

    // 1. VERIFY SECURE HASH
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
      await session.abortTransaction();
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=error&message=Invalid signature`,
      );
    }

    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const paidAmount = parseInt(vnp_Params["vnp_Amount"]) / 100;

    // 2. VERIFY AMOUNT
    const order = await Order.findById(orderId).session(session);
    if (Math.abs(paidAmount - order.totalAmount) > 1) {
      await session.abortTransaction();
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=error&message=Amount mismatch`,
      );
    }

    // 3. UPDATE ORDER
    if (responseCode === "00") {
      // Thành công
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save({ session });

      // Trừ voucher
      if (order.voucherUsed) {
        await User.findOneAndUpdate(
          { _id: order.customer, "userVouchers.voucherId": order.voucherUsed },
          { $inc: { "userVouchers.$.quantity": -1 } },
          { session },
        );
      }

      await session.commitTransaction();
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=success&orderId=${orderId}&amount=${paidAmount}`,
      );
    } else {
      // Thất bại
      order.paymentStatus = "failed";
      order.orderStatus = "pending_payment";
      await order.save({ session });

      await session.commitTransaction();
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=failed&orderId=${orderId}`,
      );
    }
  } catch (e) {
    await session.abortTransaction();
    return res.redirect(
      `${process.env.CLIENT_URL}/payment-result?status=error`,
    );
  } finally {
    session.endSession();
  }
};
```

---

## 7. 🎓 CÂU HỎI PHẢN BIỆN HỘI ĐỒNG

### ❓ Câu 1: "Tại sao không dùng SQL Transaction thay vì MongoDB Transaction?"

**Trả lời:**

| Tiêu chí         | SQL Transaction      | MongoDB Transaction         |
| ---------------- | -------------------- | --------------------------- |
| **ACID Support** | ✅ Strong (từ đầu)   | ✅ Strong (từ v4.0)         |
| **Performance**  | Slower với JOIN      | Faster (embedded documents) |
| **Schema**       | Rigid (phải migrate) | Flexible (dễ thay đổi)      |
| **Use Case**     | Financial, Banking   | Content, E-Commerce         |

**MongoDB Transaction phù hợp khi:**

- ✅ Flexible schema (sản phẩm có nhiều attributes khác nhau)
- ✅ Nested data (order chứa cartItems array)
- ✅ High read throughput
- ❌ Không phù hợp: Banking (cần ACID cực mạnh)

### ❓ Câu 2: "Nếu MoMo/VNPay gọi IPN 2 lần thì sao?"

**Trả lời:** Đã xử lý bằng **Idempotency Check**

```javascript
// Check idempotency
if (order.paymentStatus === "paid") {
  await session.abortTransaction();
  return res.status(200).json({ message: "Already processed" });
}
```

**Giải thích:**

- Payment gateway có thể **retry** nếu không nhận được response
- Nếu đơn hàng đã `paid` → Return ngay, không xử lý nữa
- → **Tránh trừ voucher 2 lần, add points 2 lần**

### ❓ Câu 3: "Tại sao không hoàn stock khi thanh toán thất bại?"

**Trả lời:**

**Design Decision:**

- User có thể **thanh toán lại** (retry payment)
- Chỉ hoàn stock khi user **HỦY ĐƠN HÀNG**
- → Tránh race condition khi user retry nhanh

**Trade-off:**

- ⚠️ Stock bị "lock" tạm thời
- ✅ User experience tốt hơn (không phải checkout lại)
- ✅ Đơn giản hóa logic

**Cải tiến:**

```javascript
// Thêm scheduled job: Tự động hủy đơn pending_payment > 24h
cron.schedule("0 * * * *", async () => {
  const expiredOrders = await Order.find({
    orderStatus: "pending_payment",
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  for (const order of expiredOrders) {
    // Hoàn stock
    for (const item of order.cartItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { quantity: item.quantity } },
      );
    }

    order.orderStatus = "cancelled";
    await order.save();
  }
});
```

### ❓ Câu 4: "Tại sao dùng findOneAndUpdate thay vì findById + save?"

**Trả lời:**

```javascript
// ❌ NON-ATOMIC (Race condition)
const product = await Product.findById(id);
product.quantity -= 10;
await product.save();
// ← Giữa findById và save, có thể có request khác cũng update

// ✅ ATOMIC (No race condition)
const product = await Product.findOneAndUpdate(
  { _id: id, quantity: { $gte: 10 } },
  { $inc: { quantity: -10 } },
  { new: true },
);
// ← MongoDB đảm bảo check và update trong 1 operation
```

**Lợi ích:**

- ✅ Atomic (không có race condition)
- ✅ Faster (1 database query thay vì 2)
- ✅ Safer (MongoDB handle concurrency)

### ❓ Câu 5: "Có vấn đề bảo mật nào không?"

**Lỗ hổng và Cách khắc phục:**

#### 1️⃣ **Price Manipulation**

```javascript
// ❌ Nguy hiểm: Tin tưởng giá từ frontend
const total = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
// User có thể sửa item.price = 1 trong devtools

// ✅ An toàn: Luôn lấy giá từ DB
const productsFromDB = await Product.find({ _id: { $in: productIds } });
const total = cartItems.reduce((sum, item) => {
  const productDB = productsFromDB.find(
    (p) => p._id.toString() === item.productId,
  );
  return sum + productDB.price * item.quantity;
}, 0);
```

#### 2️⃣ **Signature Verification**

```javascript
// ✅ Luôn verify signature từ payment gateway
const expectedSignature = crypto
  .createHmac("sha256", secretKey)
  .update(rawSignature)
  .digest("hex");

if (signature !== expectedSignature) {
  return res.status(400).json({ message: "Invalid signature" });
}
```

**Tại sao cần:**

- Chặn fake webhook từ hacker
- Đảm bảo data không bị sửa đổi

#### 3️⃣ **Input Validation**

```javascript
// ✅ Validate mọi input
if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
  return res.status(400).json({ message: "Giỏ hàng trống" });
}

if (quantity < 1 || quantity > 100) {
  return res.status(400).json({ message: "Số lượng không hợp lệ" });
}
```

---

## 8. 📝 TÓM TẮT - GHI NHỚ ĐỂ THUYẾT TRÌNH

### 🎯 5 Điểm Chính

1. **Transaction** đảm bảo dữ liệu nhất quán (all-or-nothing)
2. **Atomic Update** tránh race condition (overselling)
3. **Payment Integration** cần verify signature (bảo mật)
4. **Idempotency** tránh xử lý callback 2 lần
5. **Luôn validate giá từ DB**, không tin frontend

### 🔄 Luồng Checkout (1 câu)

> "Client gửi cartItems → Middleware xác thực user → Controller start transaction → Validate + atomic update stock → Create order → Commit transaction → Generate payment URL (if online) → Payment gateway callback → Verify signature → Update order status."

### ⚠️ Vấn đề nếu không có Transaction (1 câu)

> "Race condition overselling, partial updates (stock trừ nhưng order không tạo được), voucher bị trừ 2 lần, dữ liệu không nhất quán."

### 🚀 Cách cải thiện

- ✅ Scheduled job hủy đơn pending_payment > 24h
- ✅ Redis cache product info (giảm DB query)
- ✅ Queue system cho payment callback (scalability)
- ✅ Retry mechanism cho failed payments

---

## 9. 🎬 DEMO SCENARIOS

### Scenario 1: **Race Condition Test**

```javascript
// Gửi 2 request đồng thời mua cùng sản phẩm cuối cùng

// Request 1: Mua 5 sản phẩm (stock = 5)
POST / api / checkout;
{
  cartItems: [{ productId: "abc", quantity: 5 }];
}

// Request 2: Mua 5 sản phẩm (stock = 5)
POST / api / checkout;
{
  cartItems: [{ productId: "abc", quantity: 5 }];
}

// ❌ KHÔNG CÓ TRANSACTION:
// Request 1: Check stock = 5 OK → Trừ 5
// Request 2: Check stock = 5 OK → Trừ 5
// Kết quả: Stock = -5 (OVERSELLING!)

// ✅ CÓ TRANSACTION + ATOMIC UPDATE:
// Request 1: findOneAndUpdate({ quantity: { $gte: 5 } }) → SUCCESS, stock = 0
// Request 2: findOneAndUpdate({ quantity: { $gte: 5 } }) → FAIL (stock = 0)
// Kết quả: Request 1 thành công, Request 2 báo "Không đủ tồn kho"
```

### Scenario 2: **Payment Retry**

```javascript
// User checkout với VNPay → Không thanh toán → Về trang /track-order

// Order status: "pending_payment"
// Stock: Đã trừ
// Voucher: Chưa trừ

// User click "Thanh toán lại" → Redirect VNPay → Thanh toán thành công

// Webhook vnpayReturn():
// - Update order: "paid"
// - Trừ voucher
// - Add points
```

---

**🎓 CHÚC BẠN BẢO VỆ THÀNH CÔNG!**

_Đây là phần **nâng cao** với payment integration và transaction. Nắm vững phần này, bạn sẽ thể hiện được khả năng xử lý business logic phức tạp trong thực tế!_
