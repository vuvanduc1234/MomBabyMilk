# 🏗️ PHÂN TÍCH TOÀN BỘ KIẾN TRÚC BACKEND - MOM BABY MILK E-COMMERCE

## 🎯 Dành cho sinh viên lập trình Web - Kiến trúc Backend Professional Level

---

## 📚 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể](#2-kiến-trúc-tổng-thể)
3. [Phân tích từng tầng](#3-phân-tích-từng-tầng)
4. [Luồng hoạt động](#4-luồng-hoạt-động)
5. [Database Design](#5-database-design)
6. [Security & Authentication](#6-security--authentication)
7. [Payment Integration](#7-payment-integration)
8. [Point & Loyalty System](#8-point--loyalty-system)
9. [Best Practices](#9-best-practices)
10. [Câu hỏi phản biện](#10-câu-hỏi-phản-biện)

---

## 1. 📌 TỔNG QUAN HỆ THỐNG

### 🎯 Đây là gì?

Backend server cho hệ thống **E-Commerce bán sữa mẹ và em bé**, được xây dựng bằng **MERN Stack** (MongoDB, Express.js, React, Node.js).

### 📂 Cấu trúc thư mục

```
server/
├── server.js                    # Entry point - Khởi tạo Express app
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables
│
├── config/                      # ⚙️ CẤU HÌNH
│   ├── db.js                   # MongoDB connection
│   ├── cloudinary.js           # Upload ảnh
│   ├── mailer.js               # Email service
│   └── swagger.js              # API documentation
│
├── middleware/                  # 🔒 MIDDLEWARE (Bảo mật)
│   └── auth.js                 # JWT authentication & authorization
│
├── models/                      # 📊 MODELS (Database Schema)
│   ├── UserModel.js            # User, roles, vouchers
│   ├── ProductModel.js         # Product, pre-order, comments
│   ├── OrderModel.js           # Order, payment, pre-order items
│   ├── VoucherModel.js         # Discount vouchers
│   ├── PointModel.js           # User points balance
│   ├── PointHistoryModel.js    # Point transactions
│   ├── CategoryModel.js        # Product categories
│   ├── BrandModel.js           # Product brands
│   ├── BlogModel.js            # Blog posts
│   ├── NotificationModel.js    # User notifications
│   └── ChatHistoryModel.js     # AI chatbot history
│
├── controllers/                 # 🎮 CONTROLLERS (Business Logic)
│   ├── AuthController.js       # Login, register, password reset
│   ├── UserController.js       # Profile, admin manage users
│   ├── ProductController.js    # CRUD products, search, filter
│   ├── CheckoutController.js   # Checkout, payment integration
│   ├── OrderController.js      # Manage orders, status updates
│   ├── VoucherController.js    # CRUD vouchers, user vouchers
│   ├── PointController.js      # Points, rewards, redemption
│   ├── CategoryController.js   # CRUD categories
│   ├── BrandController.js      # CRUD brands
│   ├── BlogController.js       # CRUD blogs
│   ├── CommentController.js    # Product reviews
│   ├── WishlistController.js   # Add/remove wishlist
│   ├── NotificationController.js # Push notifications
│   ├── AnalyticsController.js  # Dashboard statistics
│   ├── AIController.js         # Chatbot with Gemini AI
│   └── UploadController.js     # Upload images to Cloudinary
│
├── routes/                      # 🛣️ ROUTES (API Endpoints)
│   ├── AuthRoute.js
│   ├── UserRoute.js
│   ├── ProductRoute.js
│   ├── CheckoutRoute.js
│   ├── OrderRoute.js
│   ├── VoucherRoute.js
│   ├── PointRoute.js
│   ├── CategoryRoute.js
│   ├── BrandRoute.js
│   ├── BlogRoute.js
│   ├── CommentRoute.js
│   ├── WishlistRoute.js
│   ├── NotificationRoute.js
│   ├── AnalyticsRoute.js
│   ├── AIRoute.js
│   ├── PaymentRoutes.js
│   └── UploadRoute.js
│
└── services/                    # 🔧 SERVICES (Reusable logic)
    ├── pointService.js         # Point calculation, lifecycle
    ├── tokenService.js         # JWT refresh token management
    └── aiService.js            # Gemini AI integration
```

### 🎯 Mục đích chính

| Chức năng            | Mô tả                                               |
| -------------------- | --------------------------------------------------- |
| **E-Commerce Core**  | Quản lý sản phẩm, giỏ hàng, đơn hàng, thanh toán    |
| **User Management**  | Đăng ký, đăng nhập, phân quyền (Admin, Staff, User) |
| **Pre-Order System** | Đặt trước sản phẩm hết hàng                         |
| **Payment Gateway**  | Tích hợp MoMo, VNPay                                |
| **Loyalty Program**  | Tích điểm, đổi thưởng, vouchers                     |
| **AI Chatbot**       | Tư vấn sản phẩm với Gemini AI                       |
| **Notifications**    | Thông báo đơn hàng, ưu đãi                          |
| **Blog & Reviews**   | Bài viết, đánh giá sản phẩm                         |

---

## 2. 🏗️ KIẾN TRÚC TỔNG THỂ

### 🎨 Pattern: **MVC + Services + Middleware**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  (React Frontend - Vite, React Router, Axios, TailwindCSS)     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Request (JSON)
                         │ Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                      │
│  - CORS Configuration                                           │
│  - Body Parsing (JSON, URL-encoded)                            │
│  - Cookie Parsing                                               │
│  - Swagger Documentation                                        │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LAYER (Routes)                       │
│  📍 /api/auth          → AuthRoute                             │
│  📍 /api/product       → ProductRoute                          │
│  📍 /api/checkout      → CheckoutRoute                         │
│  📍 /api/orders        → OrderRoute                            │
│  📍 /api/voucher       → VoucherRoute                          │
│  📍 /api/points        → PointRoute                            │
│  📍 /api/users         → UserRoute                             │
│  📍 /api/analytics     → AnalyticsRoute                        │
│  📍 /api/ai            → AIRoute                               │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER (Security)                    │
│  🔒 authenticateToken()   - Verify JWT                         │
│  🔒 checkRole()           - Check permissions                  │
│  🔒 requireAdmin()        - Admin only                         │
│  🔒 ensureConnection()    - DB health check                    │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (Business Logic)                  │
│  🎮 Validate input                                             │
│  🎮 Call services                                              │
│  🎮 Handle transactions                                        │
│  🎮 Format responses                                           │
│  🎮 Error handling                                             │
└────────┬───────────────────────┬────────────────────────────────┘
         │                       │
         │                       └──────────────┐
         ▼                                      ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│   SERVICE LAYER            │    │   EXTERNAL APIs            │
│  🔧 pointService           │    │  💳 MoMo Payment           │
│  🔧 tokenService           │    │  💳 VNPay Payment          │
│  🔧 aiService              │    │  🤖 Google Gemini AI       │
│  (Reusable logic)          │    │  ☁️ Cloudinary             │
└────────────┬───────────────┘    │  📧 Email (Nodemailer)     │
             │                     └────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL LAYER (Schema)                       │
│  📊 Define data structure                                      │
│  📊 Validation rules                                           │
│  📊 Relationships (refs)                                       │
│  📊 Indexes                                                    │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                     │
│  💾 Collections: users, products, orders, vouchers, points...  │
│  💾 Indexes: email, productId, orderId...                      │
│  💾 Transactions: ACID compliance                              │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Request Flow (Ví dụ: Checkout)

```
1. CLIENT gửi POST /api/checkout
   Headers: { Authorization: "Bearer eyJhbGc..." }
   Body: { cartItems, paymentMethod, shippingAddress }

2. ROUTING → CheckoutRoute → router.post('/', authenticateToken, checkout)

3. MIDDLEWARE → authenticateToken()
   ✓ Verify JWT token
   ✓ Extract user info: req.user = { id, role, email }
   ✓ next()

4. CONTROLLER → checkout()
   ✓ Start MongoDB transaction
   ✓ Validate input (cartItems, address, phone)
   ✓ Check product stock (atomic update)
   ✓ Validate voucher
   ✓ Calculate total (subtotal + shipping - discount)
   ✓ Create order
   ✓ Call pointService.addPendingPoints()
   ✓ Commit transaction
   ✓ Generate payment URL (if online)

5. SERVICE → pointService.addPendingPoints()
   ✓ Calculate points = orderTotal * 0.01
   ✓ Update Point.pendingPoints
   ✓ Create PointHistory record

6. DATABASE → MongoDB
   ✓ Product.findOneAndUpdate() - Trừ stock
   ✓ Order.create() - Tạo đơn hàng
   ✓ Point.save() - Cập nhật điểm

7. EXTERNAL API → MoMo/VNPay
   ✓ Create payment request
   ✓ Return payment URL

8. RESPONSE → Client
   { payUrl: "https://payment.momo.vn/...", order: {...} }
```

---

## 3. 🎯 PHÂN TÍCH TỪNG TẦNG

### 📍 1. ENTRY POINT - server.js

```javascript
// File: server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/db");

const app = express();
database.connect(); // Kết nối MongoDB

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", AuthRoute);
app.use("/api/product", ProductRoute);
app.use("/api/checkout", CheckoutRoute);
// ... các routes khác

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

**Vai trò:**

- ✅ Khởi tạo Express app
- ✅ Load environment variables
- ✅ Kết nối database
- ✅ Setup middleware (CORS, JSON parser)
- ✅ Register routes
- ✅ Start server

**Tại sao cần?**

- Entry point của ứng dụng
- Tập trung cấu hình ở 1 nơi
- Dễ bảo trì, scale

---

### 🔧 2. CONFIG LAYER

#### 📄 config/db.js - Database Connection

```javascript
const mongoose = require("mongoose");
let cachedConnection = null;

const connect = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection; // Reuse connection
  }

  const connection = await mongoose.connect(MONGODB_URI);
  cachedConnection = connection;
  return connection;
};

const ensureConnection = async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
};
```

**Giải thích:**

- **Connection Pooling**: Cache connection để reuse
- **Health Check Middleware**: `ensureConnection()` kiểm tra DB trước mỗi request
- **Serverless Friendly**: Phù hợp Vercel, AWS Lambda

**Tại sao cần cachedConnection?**

- MongoDB connection tốn thời gian (300-500ms)
- Trong serverless, function có thể reuse connection giữa các invocations
- → Tăng performance đáng kể

#### 📄 config/cloudinary.js - Image Upload

```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

**Vai trò:**

- Upload product images
- Store user avatars
- CDN delivery (fast)

#### 📄 config/mailer.js - Email Service

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Xác nhận email",
    html: `<a href="${verifyUrl}">Click để xác nhận</a>`,
  });
};
```

**Use cases:**

- Email verification
- Password reset
- Order confirmation
- Promotional emails

---

### 🔒 3. MIDDLEWARE LAYER

#### 📄 middleware/auth.js

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // { id, role, email }
    next();
  });
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ message: "Không đủ quyền" });
    }
  };
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Chỉ Admin mới có quyền" });
  }
};
```

**Giải thích chi tiết:**

| Middleware                      | Mục đích             | Khi nào dùng                  |
| ------------------------------- | -------------------- | ----------------------------- |
| `authenticateToken`             | Verify JWT token     | Mọi protected route           |
| `checkRole(['Admin', 'Staff'])` | Kiểm tra nhiều roles | Routes yêu cầu specific roles |
| `requireAdmin`                  | Admin only           | Admin dashboard, analytics    |

**Ví dụ sử dụng:**

```javascript
// Public route
router.get("/products", getProducts); // Ai cũng xem được

// User-only route
router.post("/checkout", authenticateToken, checkout);

// Staff/Admin route
router.patch(
  "/orders/:id",
  authenticateToken,
  checkRole(["Admin", "Staff"]),
  updateOrder,
);

// Admin-only route
router.get("/analytics", authenticateToken, requireAdmin, getAnalytics);
```

---

### 📊 4. MODEL LAYER (Database Schema)

#### 📄 models/UserModel.js

```javascript
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Không trả về password trong query
    },
    fullname: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Staff", "User"],
      default: "User",
    },
    userVouchers: [
      {
        _id: false,
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
        quantity: { type: Number, default: 1 },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
    // ... các fields khác
  },
  { timestamps: true },
);
```

**Giải thích:**

| Field              | Giải thích                        | Tại sao cần          |
| ------------------ | --------------------------------- | -------------------- |
| `select: false`    | Password không trả về khi query   | Bảo mật              |
| `unique: true`     | Email không trùng                 | Mỗi user 1 email     |
| `lowercase: true`  | Chuyển thành chữ thường           | Tránh case-sensitive |
| `enum`             | Giới hạn giá trị                  | Validation           |
| `ref: "Product"`   | Reference đến Product             | Join data            |
| `timestamps: true` | Tự động thêm createdAt, updatedAt | Audit trail          |

**userVouchers Array:**

```javascript
// User có thể có nhiều vouchers
userVouchers: [
  { voucherId: "voucher123", quantity: 2 },
  { voucherId: "voucher456", quantity: 1 },
];
```

#### 📄 models/ProductModel.js

```javascript
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    imageUrl: [{ type: String, required: true }],

    // PRE-ORDER FIELDS
    expectedRestockDate: {
      type: Date,
      description: "Ngày dự kiến nhập hàng lại",
    },
    allowPreOrder: {
      type: Boolean,
      default: true,
      description: "Cho phép đặt trước khi hết hàng",
    },
    maxPreOrderQuantity: {
      type: Number,
      default: 100,
      description: "Giới hạn số lượng đặt trước",
    },

    // COMMENTS/REVIEWS
    comments: [
      {
        rating: { type: Number, min: 1, max: 5 },
        content: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true },
);
```

**Tính năng đặc biệt:**

1. **Pre-Order System**:
   - Khi `quantity = 0` và `allowPreOrder = true` → Cho phép đặt trước
   - `maxPreOrderQuantity` giới hạn số lượng đặt trước
   - `expectedRestockDate` thông báo cho khách

2. **Array imageUrl**:
   - Nhiều ảnh cho 1 sản phẩm
   - `imageUrl[0]` là ảnh đại diện

3. **Embedded Comments**:
   - Comments lưu trong Product document
   - Không cần join → Faster

#### 📄 models/OrderModel.js

```javascript
const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        imageUrl: String,

        // PRE-ORDER TRACKING
        isPreOrder: { type: Boolean, default: false },
        expectedAvailableDate: Date,
        itemStatus: {
          type: String,
          enum: ["available", "preorder_pending", "preorder_ready", "shipped"],
          default: "available",
        },
      },
    ],

    totalAmount: { type: Number, required: true },
    hasPreOrderItems: { type: Boolean, default: false },

    // PAYMENT
    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // ORDER STATUS
    orderStatus: {
      type: String,
      enum: [
        "pending_payment",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "processing",
    },

    voucherUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
  },
  { timestamps: true },
);
```

**Giải thích Pre-Order Lifecycle:**

```
PRODUCT HẾT HÀNG (quantity = 0, allowPreOrder = true)
↓
USER ĐẶT TRƯỚC
↓
ORDER CREATED với cartItems[].isPreOrder = true
cartItems[].itemStatus = "preorder_pending"
↓
ADMIN NHẬP HÀNG → Update itemStatus = "preorder_ready"
↓
SHIP HÀNG → itemStatus = "shipped"
↓
ORDER STATUS = "delivered"
```

#### 📄 models/PointModel.js & PointHistoryModel.js

```javascript
// PointModel.js - Số dư điểm hiện tại
const pointSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    balance: { type: Number, default: 0 }, // Điểm khả dụng
    pendingPoints: { type: Number, default: 0 }, // Điểm chờ xác nhận
    totalEarned: { type: Number, default: 0 }, // Tổng điểm đã nhận
    totalSpent: { type: Number, default: 0 }, // Tổng điểm đã dùng
  },
  { timestamps: true },
);

// PointHistoryModel.js - Lịch sử giao dịch điểm
const pointHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["earn", "spend", "refund", "expire"],
      required: true,
    },
    amount: { type: Number, required: true }, // + cho earn, - cho spend
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    reason: String,
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    balanceBefore: Number,
    balanceAfter: Number,
  },
  { timestamps: true },
);
```

**Point Lifecycle:**

```
USER ĐẶT HÀNG
↓
addPendingPoints() → pendingPoints += X
PointHistory: { type: "earn", status: "pending" }
↓
ORDER DELIVERED
↓
confirmPendingPoints() → balance += X, pendingPoints -= X
PointHistory: { status: "confirmed" }
↓
USER ĐỔI THƯỞNG
↓
balance -= Y, totalSpent += Y
PointHistory: { type: "spend", status: "confirmed" }
```

---

### 🎮 5. CONTROLLER LAYER

Controllers xử lý business logic, gọi services, và format responses.

#### 📄 controllers/AuthController.js

```javascript
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
    }

    // 2. Find user (include password field)
    const userRecord = await User.findOne({ email }).select("+password");
    if (!userRecord) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác" });
    }

    // 3. Verify password
    const valid = await bcrypt.compare(password, userRecord.password);
    if (!valid) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác" });
    }

    // 4. Generate tokens
    const user = {
      id: userRecord._id,
      email: userRecord.email,
      role: userRecord.role,
    };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // 5. Save refresh token to DB
    await saveRefreshToken(user.id, refreshToken);

    // 6. Set cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 7. Response
    res.json({ accessToken, user });
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
```

**Giải thích chi tiết:**

| Step                     | Giải thích                     | Tại sao quan trọng           |
| ------------------------ | ------------------------------ | ---------------------------- |
| 1. Validate              | Kiểm tra input không null      | Tránh lỗi DB query           |
| 2. select("+password")   | Password mặc định không trả về | Phải explicit select         |
| 3. bcrypt.compare()      | So sánh hash                   | Không lưu plaintext password |
| 4. JWT tokens            | Access (15m) + Refresh (7d)    | Balance security & UX        |
| 5. saveRefreshToken()    | Lưu DB để logout/revoke        | Có thể thu hồi token         |
| 6. httpOnly cookie       | Cookie không đọc bởi JS        | Chống XSS                    |
| 7. Không trả về password | Chỉ trả user info              | Bảo mật                      |

**Tại sao dùng 2 tokens?**

- **Access Token (15 phút)**: Gửi mọi request, ngắn hạn → an toàn
- **Refresh Token (7 ngày)**: Chỉ dùng để lấy access token mới → UX tốt

#### 📄 controllers/CheckoutController.js

**(Đã phân tích chi tiết ở file BACKEND_ANALYSIS_CHECKOUT_CONTROLLER.md)**

**Tóm tắt:**

- ✅ Transaction Management (ACID)
- ✅ Atomic Stock Update (tránh overselling)
- ✅ Voucher Validation & Deduction
- ✅ Pre-Order Handling
- ✅ Payment Gateway Integration (MoMo, VNPay)
- ✅ Webhook Handling (verify signature)
- ✅ Idempotency (tránh duplicate processing)

#### 📄 controllers/OrderController.js

```javascript
const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { orderStatus, itemStatuses } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Update order status
    order.orderStatus = orderStatus;

    // Update individual items status
    if (itemStatuses && Array.isArray(itemStatuses)) {
      for (const { productId, itemStatus } of itemStatuses) {
        const item = order.cartItems.find(
          (i) => i.product.toString() === productId,
        );
        if (item) {
          item.itemStatus = itemStatus;
        }
      }
    }

    await order.save({ session });

    // DELIVERED → Confirm pending points
    if (orderStatus === "delivered" && order.paymentStatus === "paid") {
      await confirmPendingPoints(order.customer, order._id, session);
    }

    // CANCELLED → Cancel pending points & restore stock
    if (orderStatus === "cancelled") {
      await cancelPendingPoints(order.customer, order._id, session);

      for (const item of order.cartItems) {
        if (!item.isPreOrder) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { quantity: item.quantity } },
            { session },
          );
        }
      }
    }

    await session.commitTransaction();

    // Send notification
    await createNotification({
      userId: order.customer,
      type: "order_status_updated",
      title: `Đơn hàng #${order._id.toString().slice(-6)} ${translateStatus(orderStatus)}`,
      message: `Trạng thái đơn hàng của bạn đã được cập nhật`,
      orderId: order._id,
    });

    res.json({ message: "Cập nhật thành công", order });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
```

**Point System Integration:**

| Order Status   | Action                                       |
| -------------- | -------------------------------------------- |
| **processing** | `addPendingPoints()` → pendingPoints += X    |
| **delivered**  | `confirmPendingPoints()` → balance += X      |
| **cancelled**  | `cancelPendingPoints()` → pendingPoints -= X |

---

### 🔧 6. SERVICE LAYER

Services chứa reusable business logic.

#### 📄 services/pointService.js

```javascript
// Tính điểm từ đơn hàng
const calculatePointsFromOrder = (orderTotal) => {
  return Math.floor(orderTotal * 0.01); // 1% của giá trị đơn hàng
};

// Thêm điểm pending (khi đặt hàng)
const addPendingPoints = async (
  userId,
  orderId,
  orderTotal,
  session = null,
) => {
  const points = calculatePointsFromOrder(orderTotal);
  if (points <= 0) return null;

  const point = await getOrCreatePoint(userId);
  const balanceBefore = point.balance;

  point.pendingPoints += points;
  await point.save({ session });

  const history = await PointHistory.create(
    [
      {
        user: userId,
        type: "earn",
        amount: points,
        status: "pending",
        reason: "Order placed (pending delivery)",
        relatedOrder: orderId,
        balanceBefore,
        balanceAfter: balanceBefore,
      },
    ],
    { session },
  );

  return { point, history: history[0], pointsEarned: points };
};

// Xác nhận điểm (khi giao hàng thành công)
const confirmPendingPoints = async (userId, orderId, session = null) => {
  const point = await Point.findOne({ user: userId }).session(session);
  const pendingHistory = await PointHistory.findOne({
    user: userId,
    relatedOrder: orderId,
    type: "earn",
    status: "pending",
  }).session(session);

  if (!pendingHistory) return null;

  const amount = pendingHistory.amount;

  point.pendingPoints -= amount;
  point.balance += amount;
  point.totalEarned += amount;
  await point.save({ session });

  pendingHistory.status = "confirmed";
  pendingHistory.balanceAfter = point.balance;
  await pendingHistory.save({ session });

  return { point, pointsConfirmed: amount };
};

// Hủy điểm pending (khi hủy đơn)
const cancelPendingPoints = async (userId, orderId, session = null) => {
  // ... tương tự confirmPendingPoints nhưng không cộng vào balance
};
```

**Tại sao cần Service Layer?**

| Lý do                      | Giải thích                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| **Reusability**            | `addPendingPoints()` dùng ở CheckoutController và OrderController |
| **Testability**            | Dễ test riêng biệt                                                |
| **Separation of Concerns** | Controller không cần biết logic tính điểm                         |
| **Maintainability**        | Thay đổi công thức tính điểm chỉ sửa 1 chỗ                        |

#### 📄 services/tokenService.js

```javascript
const RefreshToken = require("../models/RefreshTokenModel");

const saveRefreshToken = async (userId, token) => {
  await RefreshToken.create({ userId, token });
};

const findRefreshToken = async (token) => {
  return await RefreshToken.findOne({ token });
};

const removeRefreshToken = async (token) => {
  await RefreshToken.deleteOne({ token });
};

const replaceRefreshToken = async (oldToken, newToken) => {
  await RefreshToken.updateOne({ token: oldToken }, { token: newToken });
};
```

**Tại sao lưu refresh token vào DB?**

- ✅ Có thể **revoke** token (logout từ xa)
- ✅ **Audit trail**: Biết user login từ bao nhiêu devices
- ✅ **Token rotation**: Thay token cũ bằng token mới

---

### 🛣️ 7. ROUTE LAYER

Routes định nghĩa API endpoints và áp middleware.

#### 📄 routes/ProductRoute.js

```javascript
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
  checkRole,
} = require("../middleware/auth");

// PUBLIC ROUTES (không cần authentication)
router.get("/", viewProduct); // Xem tất cả sản phẩm
router.get("/:id", getProductsById); // Xem chi tiết sản phẩm
router.get("/category/:id", getProductsByCategory);
router.get("/brand/:id", getProductsByBrand);

// PROTECTED ROUTES (cần authentication)
router.post("/", authenticateToken, requireAdmin, createProduct);
router.put("/:id", authenticateToken, requireAdmin, updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
```

**Phân quyền:**

| Endpoint            | Method | Authentication | Authorization | Ai được dùng |
| ------------------- | ------ | -------------- | ------------- | ------------ |
| GET /product        | GET    | ❌             | ❌            | Mọi người    |
| GET /product/:id    | GET    | ❌             | ❌            | Mọi người    |
| POST /product       | POST   | ✅             | Admin only    | Admin        |
| PUT /product/:id    | PUT    | ✅             | Admin only    | Admin        |
| DELETE /product/:id | DELETE | ✅             | Admin only    | Admin        |

#### 📄 routes/CheckoutRoute.js

```javascript
const router = express.Router();

// PROTECTED - User phải đăng nhập
router.post("/", authenticateToken, checkout);

// PUBLIC - Payment gateway callbacks (verify bằng signature)
router.post("/momo-ipn", momoNotify);
router.get("/vnpay-return", vnpayReturn);

module.exports = router;
```

**Tại sao callback routes không cần auth?**

- MoMo/VNPay server gọi, không có JWT token
- Verify bằng **signature** (HMAC-SHA256)
- Nếu signature không khớp → Reject

---

## 4. 🔄 LUỒNG HOẠT ĐỘNG TOÀN BỘ HỆ THỐNG

### 📝 Use Case 1: User Đăng Ký & Đăng Nhập

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ĐĂNG KÝ                                                  │
└─────────────────────────────────────────────────────────────┘

CLIENT: POST /api/auth/register
Body: { email, password, fullname }
↓
AuthController.register()
├─ Validate input (email format, strong password)
├─ Check email đã tồn tại chưa
├─ Hash password (bcrypt.hash())
├─ Create User (role = "User")
├─ Generate emailVerificationToken
├─ Send verification email
└─ Response: { message: "Kiểm tra email để xác nhận" }

USER: Click link trong email
↓
CLIENT: GET /api/auth/verify-email?token=abc123
↓
AuthController.verifyEmail()
├─ Find user by emailVerificationToken
├─ Check token chưa hết hạn
├─ Update user.isVerified = true
└─ Response: { message: "Email đã được xác nhận" }

┌─────────────────────────────────────────────────────────────┐
│ 2. ĐĂNG NHẬP                                                │
└─────────────────────────────────────────────────────────────┘

CLIENT: POST /api/auth/login
Body: { email, password }
↓
AuthController.login()
├─ Find User (select: "+password")
├─ Verify password (bcrypt.compare())
├─ Generate accessToken (15m)
├─ Generate refreshToken (7d)
├─ Save refreshToken to DB
├─ Set httpOnly cookie
└─ Response: { accessToken, user: { id, email, role } }

CLIENT: Lưu accessToken vào localStorage
└─ Tất cả requests sau đó gửi: Authorization: Bearer <accessToken>
```

### 📝 Use Case 2: Tìm & Xem Sản Phẩm

```
CLIENT: GET /api/product?search=similac&category=sua-bot
↓
ProductController.viewProduct()
├─ Parse query params (search, category, brand, minPrice, maxPrice)
├─ Build MongoDB query
│   const query = {
│     name: { $regex: "similac", $options: "i" },
│     category: categoryId,
│     price: { $gte: minPrice, $lte: maxPrice }
│   };
├─ Product.find(query)
│   .populate("category", "name")
│   .populate("brand", "name")
│   .sort({ createdAt: -1 })
├─ Calculate average rating cho mỗi product
└─ Response: { products: [...], total: 50 }

CLIENT: Click vào sản phẩm
↓
CLIENT: GET /api/product/:id
↓
ProductController.getProductsById()
├─ Product.findById(id)
│   .populate("category")
│   .populate("brand")
│   .populate("comments.author", "fullname avatar")
├─ Check product có cho phép pre-order không
│   if (quantity === 0 && allowPreOrder) {
│     canPreOrder = true;
│     maxQuantity = maxPreOrderQuantity;
│   }
└─ Response: { product, canPreOrder, maxQuantity }
```

### 📝 Use Case 3: Checkout - Luồng Chi Tiết

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: USER THÊM SẢN PHẨM VÀO GIỎ                         │
└─────────────────────────────────────────────────────────────┘

CLIENT: CartContext (React Context)
├─ addToCart({ productId, quantity })
├─ Lưu vào localStorage
└─ cart = [
      { productId: "abc123", quantity: 2 },
      { productId: "def456", quantity: 1 }
    ]

┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: CHECKOUT                                            │
└─────────────────────────────────────────────────────────────┘

CLIENT: POST /api/checkout
Headers: { Authorization: "Bearer eyJhbG..." }
Body: {
  cartItems: [{ productId: "abc123", quantity: 2 }],
  paymentMethod: "momo",
  voucherUsed: "voucher123",
  shippingAddress: "123 Nguyễn Văn A",
  phone: "0912345678"
}
↓
Middleware: authenticateToken()
├─ Verify JWT → req.user = { id: "user123", role: "User" }
└─ next()
↓
CheckoutController.checkout()

  ┌─────────────────────────────────────────┐
  │ START TRANSACTION                       │
  └─────────────────────────────────────────┘
  const session = await mongoose.startSession();
  session.startTransaction();

  ┌─────────────────────────────────────────┐
  │ STEP 1: Validate Input                  │
  └─────────────────────────────────────────┘
  ├─ userId = req.user.id
  ├─ Check cartItems not empty
  ├─ Check shippingAddress, phone
  └─ Validate paymentMethod ∈ ["cod", "momo", "vnpay"]

  ┌─────────────────────────────────────────┐
  │ STEP 2: Load User                       │
  └─────────────────────────────────────────┘
  const user = await User.findById(userId).session(session);

  ┌─────────────────────────────────────────┐
  │ STEP 3: Validate & Atomic Stock Update  │
  └─────────────────────────────────────────┘
  const productIds = cartItems.map(item => item.productId);
  const productsFromDB = await Product.find({ _id: { $in: productIds } });

  for (const item of cartItems) {
    const productDB = productsFromDB.find(p => p._id === item.productId);

    // ✅ LUÔN DÙNG GIÁ TỪ DB (không tin frontend)
    const price = productDB.price;

    if (productDB.quantity >= item.quantity) {
      // Đủ hàng → Atomic update
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Không đủ tồn kho" });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        isPreOrder: false,
        itemStatus: "available"
      });

    } else if (productDB.allowPreOrder) {
      // Hết hàng nhưng cho đặt trước
      const availableStock = productDB.quantity;
      const preOrderQuantity = item.quantity - availableStock;

      // Validate giới hạn pre-order
      if (preOrderQuantity > productDB.maxPreOrderQuantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Chỉ cho phép đặt trước tối đa ${productDB.maxPreOrderQuantity} sản phẩm`
        });
      }

      // Trừ stock có sẵn
      if (availableStock > 0) {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { quantity: -availableStock } },
          { session }
        );

        orderItems.push({
          product: productDB._id,
          quantity: availableStock,
          isPreOrder: false,
          itemStatus: "available"
        });
      }

      // Thêm pre-order item
      orderItems.push({
        product: productDB._id,
        quantity: preOrderQuantity,
        isPreOrder: true,
        expectedAvailableDate: productDB.expectedRestockDate,
        itemStatus: "preorder_pending"
      });

      hasPreOrder = true;
    } else {
      await session.abortTransaction();
      return res.status(400).json({ message: "Sản phẩm hết hàng" });
    }
  }

  ┌─────────────────────────────────────────┐
  │ STEP 4: Calculate Total                 │
  └─────────────────────────────────────────┘
  const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subTotal > 500000 ? 0 : 30000;

  ┌─────────────────────────────────────────┐
  │ STEP 5: Validate & Apply Voucher        │
  └─────────────────────────────────────────┘
  let discount = 0;
  if (voucherUsed) {
    const voucher = await Voucher.findById(voucherUsed).session(session);

    // Validate voucher
    if (!voucher.isActive) throw Error("Voucher không hợp lệ");
    if (new Date() > voucher.expiryDate) throw Error("Voucher hết hạn");
    if (subTotal < voucher.minOrderValue) throw Error("Đơn hàng chưa đủ giá trị");

    // Check user có voucher này không
    const userVoucher = user.userVouchers.find(uv => uv.voucherId === voucherUsed);
    if (!userVoucher || userVoucher.quantity <= 0) {
      throw Error("Bạn không có voucher này");
    }

    discount = Math.round((subTotal * voucher.discountPercentage) / 100);

    // ⚠️ CHỈ TRỪ VOUCHER CHO COD
    // Online payment → Trừ sau khi thanh toán thành công
    if (paymentMethod === "cod") {
      await User.findOneAndUpdate(
        { _id: userId, "userVouchers.voucherId": voucherUsed, "userVouchers.quantity": { $gt: 0 } },
        { $inc: { "userVouchers.$.quantity": -1 } },
        { session }
      );
    }
  }

  const total = subTotal + shippingFee - discount;

  ┌─────────────────────────────────────────┐
  │ STEP 6: Create Order                    │
  └─────────────────────────────────────────┘
  const order = await Order.create([{
    customer: userId,
    cartItems: orderItems,
    shippingAddress,
    phone,
    totalAmount: total,
    voucherUsed: voucherUsed || null,
    paymentMethod,
    paymentStatus: "pending",
    hasPreOrderItems: hasPreOrder,
    orderStatus: paymentMethod === "cod" ? "processing" : "pending_payment"
  }], { session });

  ┌─────────────────────────────────────────┐
  │ STEP 7: Commit Transaction              │
  └─────────────────────────────────────────┘
  await session.commitTransaction();

  ┌─────────────────────────────────────────┐
  │ STEP 8: Add Pending Points (COD)        │
  └─────────────────────────────────────────┘
  if (paymentMethod === "cod") {
    await pointService.addPendingPoints(userId, order._id, total);
    return res.json({ message: "Đặt hàng thành công", order });
  }

  ┌─────────────────────────────────────────┐
  │ STEP 9: Generate Payment URL (Online)   │
  └─────────────────────────────────────────┘
  if (paymentMethod === "momo") {
    const payUrl = await createMomoUrl(order);
    return res.json({ payUrl, order });
  }
  // Tương tự cho VNPay...

┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: THANH TOÁN ONLINE (MOMO/VNPAY)                     │
└─────────────────────────────────────────────────────────────┘

CLIENT: Redirect user đến payUrl
↓
USER: Thanh toán trên MoMo/VNPay
↓
MOMO/VNPAY: Gọi webhook (IPN)
POST /api/checkout/momo-ipn
Body: { orderId, resultCode, signature, ... }
↓
CheckoutController.momoNotify()

  ┌─────────────────────────────────────────┐
  │ START TRANSACTION                       │
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │ STEP 1: Verify Signature                │
  └─────────────────────────────────────────┘
  const rawSignature = `accessKey=...&orderId=...`;
  const expectedSignature = crypto.createHmac("sha256", secretKey)
    .update(rawSignature).digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  ┌─────────────────────────────────────────┐
  │ STEP 2: Find Order                      │
  └─────────────────────────────────────────┘
  const order = await Order.findById(orderId).session(session);

  ┌─────────────────────────────────────────┐
  │ STEP 3: Check Idempotency               │
  └─────────────────────────────────────────┘
  if (order.paymentStatus === "paid") {
    // Đã xử lý rồi → Return OK (tránh xử lý 2 lần)
    return res.status(200).json({ message: "Already processed" });
  }

  ┌─────────────────────────────────────────┐
  │ STEP 4: Update Order Status             │
  └─────────────────────────────────────────┘
  if (resultCode == 0) { // Thành công
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
    await pointService.addPendingPoints(order.customer, order._id, order.totalAmount, session);

  } else { // Thất bại
    order.paymentStatus = "failed";
    order.orderStatus = "pending_payment"; // Cho phép thanh toán lại
    await order.save({ session });
  }

  await session.commitTransaction();
  return res.status(200).json({ message: "OK" });

┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: GIAO HÀNG THÀNH CÔNG                               │
└─────────────────────────────────────────────────────────────┘

ADMIN/STAFF: PATCH /api/orders/:id
Body: { orderStatus: "delivered" }
↓
OrderController.updateOrderStatus()
  ├─ Update order.orderStatus = "delivered"
  ├─ confirmPendingPoints(userId, orderId)
  │   ├─ pendingPoints -= X
  │   ├─ balance += X
  │   ├─ totalEarned += X
  │   └─ PointHistory: status = "confirmed"
  └─ Send notification to user
```

---

## 5. 📊 DATABASE DESIGN

### 🔗 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│    User      │         │   Product    │
├──────────────┤         ├──────────────┤
│ _id          │         │ _id          │
│ email        │         │ name         │
│ password     │         │ price        │
│ role         │         │ quantity     │
│ userVouchers │◀───┐    │ category ────┼──────▶ Category
│ wishlist ────┼────┼───▶│ brand ───────┼──────▶ Brand
└──────┬───────┘    │    │ comments[]   │
       │            │    └──────────────┘
       │            │
       │            │    ┌──────────────┐
       │            └────│   Voucher    │
       │                 ├──────────────┤
       │                 │ _id          │
       │                 │ code         │
       │                 │ discount%    │
       │                 │ expiryDate   │
       │                 └──────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│    Order     │                  │    Point     │
├──────────────┤                  ├──────────────┤
│ _id          │                  │ _id          │
│ customer ────┼──────▶ User      │ user ────────┼──────▶ User
│ cartItems[]  │                  │ balance      │
│ totalAmount  │                  │ pendingPoints│
│ paymentMethod│                  │ totalEarned  │
│ orderStatus  │                  │ totalSpent   │
│ voucherUsed ─┼─────▶ Voucher    └──────────────┘
└──────┬───────┘                         │
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│ Notification │                  │PointHistory  │
├──────────────┤                  ├──────────────┤
│ _id          │                  │ _id          │
│ user ────────┼──────▶ User      │ user ────────┼──────▶ User
│ type         │                  │ type         │
│ title        │                  │ amount       │
│ message      │                  │ status       │
│ orderId      │                  │ relatedOrder │
│ isRead       │                  │ balanceBefore│
└──────────────┘                  │ balanceAfter │
                                  └──────────────┘
```

### 📦 Collections & Relationships

| Collection       | References To          | Referenced By                            |
| ---------------- | ---------------------- | ---------------------------------------- |
| **User**         | -                      | Order, Point, PointHistory, Notification |
| **Product**      | Category, Brand        | Order.cartItems[], User.wishlist[]       |
| **Order**        | User, Product, Voucher | PointHistory, Notification               |
| **Voucher**      | -                      | User.userVouchers[], Order               |
| **Point**        | User                   | -                                        |
| **PointHistory** | User, Order            | -                                        |
| **Category**     | -                      | Product                                  |
| **Brand**        | -                      | Product                                  |

---

## 6. 🔒 SECURITY & AUTHENTICATION

### 🛡️ Security Measures Implemented

| Measure                      | Implementation                          | File                  |
| ---------------------------- | --------------------------------------- | --------------------- |
| **Password Hashing**         | bcrypt (salt rounds: 10)                | AuthController.js     |
| **JWT Tokens**               | Access (15m) + Refresh (7d)             | AuthController.js     |
| **SQL Injection Prevention** | Mongoose escapes queries                | All Models            |
| **XSS Prevention**           | sanitize-html for blog content          | BlogController.js     |
| **CORS**                     | Whitelist origins                       | server.js             |
| **Rate Limiting**            | (TODO: Implement)                       | -                     |
| **Input Validation**         | Manual validation + Mongoose validators | All Controllers       |
| **httpOnly Cookies**         | Refresh token in cookie                 | AuthController.js     |
| **Signature Verification**   | HMAC-SHA256 for MoMo/VNPay              | CheckoutController.js |
| **Atomic Updates**           | findOneAndUpdate với conditions         | CheckoutController.js |

### 🔐 Authentication Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Generate Access Token (15 minutes)      │
│ Generate Refresh Token (7 days)         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Save Refresh Token to DB                │
│ Set Refresh Token in httpOnly Cookie    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Client lưu Access Token (localStorage)  │
│ Client gửi: Authorization: Bearer <AT>  │
└──────┬──────────────────────────────────┘
       │
       ├──────────── Access Token hết hạn ────────────┐
       │                                               │
       ▼                                               ▼
┌─────────────────────┐                    ┌──────────────────────┐
│ Middleware reject   │                    │ Client gọi           │
│ 403 Forbidden       │────────────────────│ POST /api/auth/token │
└─────────────────────┘                    │ (gửi RT qua cookie)  │
                                            └──────────┬───────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │ Verify Refresh Token │
                                            │ Generate new AT      │
                                            │ Rotate RT (optional) │
                                            └──────────┬───────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │ Return new AT        │
                                            │ Client tiếp tục dùng │
                                            └──────────────────────┘
```

---

## 7. 💳 PAYMENT INTEGRATION

### 🔵 MoMo Flow

```
1. USER CHỌN MOMO
   ↓
2. BACKEND: createMomoUrl(order)
   ├─ partnerCode, accessKey, secretKey
   ├─ Create rawSignature
   ├─ signature = HMAC-SHA256(rawSignature, secretKey)
   ├─ POST → MoMo API
   └─ Return payUrl
   ↓
3. CLIENT: Redirect user → payUrl
   ↓
4. USER THANH TOÁN trên MoMo
   ↓
5. MOMO: POST /api/checkout/momo-ipn (IPN Callback)
   Body: { orderId, resultCode, signature, ... }
   ↓
6. BACKEND: momoNotify()
   ├─ Verify signature
   ├─ Find order
   ├─ Check idempotency
   ├─ if resultCode == 0:
   │   ├─ Update paymentStatus = "paid"
   │   ├─ Trừ voucher
   │   └─ Add pending points
   └─ Response: 200 OK
   ↓
7. MOMO: Redirect user → /payment-result?status=success
```

### 🟢 VNPay Flow

```
1. USER CHỌN VNPAY
   ↓
2. BACKEND: createVnpayUrl(order, req)
   ├─ Build vnp_Params (Version, Command, TmnCode, Amount, ...)
   ├─ Sort params alphabetically
   ├─ signData = qs.stringify(vnp_Params)
   ├─ vnp_SecureHash = HMAC-SHA512(signData, secretKey)
   └─ Return vnpUrl + "?" + qs.stringify(vnp_Params)
   ↓
3. CLIENT: Redirect user → vnpUrl
   ↓
4. USER THANH TOÁN trên VNPay
   ↓
5. VNPAY: GET /api/checkout/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=...
   ↓
6. BACKEND: vnpayReturn()
   ├─ Verify vnp_SecureHash
   ├─ Verify vnp_Amount === order.totalAmount
   ├─ Check idempotency
   ├─ if vnp_ResponseCode == "00":
   │   ├─ Update paymentStatus = "paid"
   │   ├─ Trừ voucher
   │   ├─ Add pending points
   │   └─ Redirect: /payment-result?status=success
   └─ else:
       └─ Redirect: /payment-result?status=failed
```

### ⚠️ Security Considerations

| Risk                   | Mitigation                                       |
| ---------------------- | ------------------------------------------------ |
| **Fake Webhook**       | Verify signature (HMAC-SHA256/SHA512)            |
| **Replay Attack**      | Check idempotency (`paymentStatus === "paid"`)   |
| **Amount Tampering**   | Verify amount from gateway === order.totalAmount |
| **Man-in-the-Middle**  | Use HTTPS only                                   |
| **Signature Mismatch** | Reject immediately (400 Bad Request)             |

---

## 8. 🎁 POINT & LOYALTY SYSTEM

### 📊 Point Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                    POINT STATES                              │
├──────────────────────────────────────────────────────────────┤
│ PENDING POINTS    - Chờ xác nhận (order chưa delivered)     │
│ BALANCE           - Điểm khả dụng (có thể dùng)             │
│ TOTAL EARNED      - Tổng điểm đã nhận (audit)               │
│ TOTAL SPENT       - Tổng điểm đã tiêu (audit)               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   LIFECYCLE FLOW                             │
└──────────────────────────────────────────────────────────────┘

1. ORDER CREATED
   ├─ Calculate points = orderTotal * 0.01
   ├─ pendingPoints += points
   └─ PointHistory.create({ type: "earn", status: "pending" })

2. ORDER DELIVERED
   ├─ pendingPoints -= points
   ├─ balance += points
   ├─ totalEarned += points
   └─ PointHistory.update({ status: "confirmed" })

3. ORDER CANCELLED
   ├─ pendingPoints -= points
   └─ PointHistory.update({ status: "cancelled" })

4. USER REDEEM REWARD
   ├─ balance -= points
   ├─ totalSpent += points
   └─ PointHistory.create({ type: "spend", status: "confirmed" })

5. ORDER REFUNDED (sau khi delivered)
   ├─ balance -= points (refund)
   ├─ totalEarned -= points
   └─ PointHistory.create({ type: "refund" })
```

### 🎁 Reward System

```javascript
// RewardItemModel.js
const rewardItemSchema = new mongoose.Schema({
  name: String, // Tên phần thưởng
  description: String,
  type: {
    type: String,
    enum: ["voucher", "product", "discount", "shipping"],
    required: true,
  },
  pointsRequired: { type: Number, required: true }, // Điểm cần thiết
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
  stock: { type: Number, default: 0 }, // Số lượng còn lại
  isActive: { type: Boolean, default: true },
});

// PointController.js
const redeemReward = async (req, res) => {
  const { rewardId } = req.body;
  const userId = req.user.id;

  const reward = await RewardItem.findById(rewardId);
  const point = await Point.findOne({ user: userId });

  if (point.balance < reward.pointsRequired) {
    return res.status(400).json({ message: "Không đủ điểm" });
  }

  // Trừ điểm
  point.balance -= reward.pointsRequired;
  point.totalSpent += reward.pointsRequired;
  await point.save();

  // Ghi lịch sử
  await PointHistory.create({
    user: userId,
    type: "spend",
    amount: -reward.pointsRequired,
    reason: `Redeemed ${reward.name}`,
  });

  // Cộng voucher cho user
  if (reward.type === "voucher") {
    await User.findByIdAndUpdate(userId, {
      $push: { userVouchers: { voucherId: reward.voucherId, quantity: 1 } },
    });
  }

  res.json({ message: "Đổi thưởng thành công" });
};
```

---

## 9. ✅ BEST PRACTICES ĐƯỢC ÁP DỤNG

### 🎨 Code Organization

| Practice                        | Implementation                              |
| ------------------------------- | ------------------------------------------- |
| **Separation of Concerns**      | Controller → Service → Model                |
| **DRY (Don't Repeat Yourself)** | Services tái sử dụng logic                  |
| **Single Responsibility**       | Mỗi function 1 nhiệm vụ                     |
| **Meaningful Names**            | `authenticateToken`, `confirmPendingPoints` |

### 🔒 Security

| Practice                      | Implementation                |
| ----------------------------- | ----------------------------- |
| **Never trust client input**  | Validate & sanitize mọi input |
| **Use environment variables** | `.env` cho secrets            |
| **Hash passwords**            | bcrypt với salt               |
| **JWT with expiration**       | Access 15m, Refresh 7d        |
| **HTTPS only in production**  | `secure: true` for cookies    |

### 💾 Database

| Practice                 | Implementation                    |
| ------------------------ | --------------------------------- |
| **Use transactions**     | Checkout, OrderUpdate             |
| **Atomic updates**       | `findOneAndUpdate` với conditions |
| **Indexes**              | email, productId, orderId         |
| **Populate selectively** | Chỉ populate fields cần thiết     |
| **Projection**           | Chỉ select fields cần thiết       |

### ⚡ Performance

| Practice               | Implementation                |
| ---------------------- | ----------------------------- |
| **Connection pooling** | Cached MongoDB connection     |
| **Pagination**         | (TODO) Limit results          |
| **Caching**            | (TODO) Redis for product data |
| **Lazy loading**       | Populate on-demand            |

---

## 10. 🎓 CÂU HỎI PHẢN BIỆN HỘI ĐỒNG

### ❓ Câu 1: "Tại sao dùng MongoDB thay vì MySQL?"

**Trả lời:**

| Tiêu chí              | MySQL                | MongoDB                |
| --------------------- | -------------------- | ---------------------- |
| **Schema**            | Rigid (fixed schema) | Flexible (schema-less) |
| **JOIN**              | Strong support       | Limited (use $lookup)  |
| **Scalability**       | Vertical             | Horizontal (sharding)  |
| **JSON Data**         | Cần parse            | Native support         |
| **Development Speed** | Slower (migrations)  | Faster (no migrations) |

**MongoDB phù hợp khi:**

- ✅ Schema thay đổi thường xuyên (sản phẩm có nhiều attributes khác nhau)
- ✅ Nested data (Order chứa cartItems array)
- ✅ High read throughput
- ✅ Rapid prototyping

**MySQL phù hợp khi:**

- ❌ Complex JOINs (báo cáo phức tạp)
- ❌ Strict ACID requirements (banking)
- ❌ Fixed schema (ít thay đổi)

### ❓ Câu 2: "Tại sao dùng Service Layer? Controller không đủ sao?"

**Trả lời:**

**Không có Service Layer:**

```javascript
// ❌ Controller phình to, logic trùng lặp
const checkout = async (req, res) => {
  // ... validate, create order

  // Tính điểm (duplicate code)
  const points = Math.floor(order.totalAmount * 0.01);
  const point = await Point.findOne({ user: userId });
  point.pendingPoints += points;
  await point.save();

  await PointHistory.create({ ... });
};

const updateOrderStatus = async (req, res) => {
  // ... update order

  // Tính điểm LẠI (duplicate code)
  const points = Math.floor(order.totalAmount * 0.01);
  const point = await Point.findOne({ user: userId });
  point.balance += points;
  await point.save();
};
```

**Có Service Layer:**

```javascript
// ✅ Controller gọn, logic tái sử dụng
const checkout = async (req, res) => {
  // ... validate, create order
  await pointService.addPendingPoints(userId, orderId, total);
};

const updateOrderStatus = async (req, res) => {
  // ... update order
  await pointService.confirmPendingPoints(userId, orderId);
};
```

**Lợi ích:**

- ✅ **Reusability**: Dùng lại ở nhiều nơi
- ✅ **Testability**: Test riêng biệt
- ✅ **Maintainability**: Sửa 1 chỗ → Áp dụng mọi nơi
- ✅ **Separation of Concerns**: Controller chỉ điều phối, Service xử lý logic

### ❓ Câu 3: "Race Condition trong stock management - Có an toàn không?"

**Trả lời:**

**❌ KHÔNG AN TOÀN (Non-atomic):**

```javascript
const product = await Product.findById(id);
if (product.quantity >= 10) {
  // ⚠️ NGUY HIỂM: Giữa check và update, request khác có thể cũng đang xử lý
  await Product.updateOne({ _id: id }, { $inc: { quantity: -10 } });
}

// KỊ BẢN:
// Request 1: Check quantity = 15 → OK → Trừ 10
// Request 2: Check quantity = 15 → OK → Trừ 10
// Kết quả: quantity = -5 (OVERSELLING!)
```

**✅ AN TOÀN (Atomic):**

```javascript
const product = await Product.findOneAndUpdate(
  { _id: id, quantity: { $gte: 10 } }, // ← Check và update CÙNG LÚC
  { $inc: { quantity: -10 } },
  { new: true },
);

if (!product) {
  return res.status(400).json({ message: "Không đủ tồn kho" });
}

// MongoDB đảm bảo:
// Request 1: Check & update → quantity = 5 → SUCCESS
// Request 2: Check fails (quantity = 5 < 10) → product = null → FAIL
```

**Tại sao an toàn?**

- MongoDB thực hiện **check và update trong 1 operation duy nhất**
- Database-level locking
- Không có khoảng thời gian giữa check và update

### ❓ Câu 4: "Tại sao cần Transaction? MongoDB không phải NoSQL sao?"

**Trả lời:**

**MongoDB ≠ Không có Transaction**

- MongoDB 4.0+ hỗ trợ **Multi-Document ACID Transactions**
- Tương tự SQL transactions: All-or-nothing

**Ví dụ thực tế:**

```javascript
// ❌ KHÔNG CÓ TRANSACTION
await Product.updateOne({ _id: id }, { $inc: { quantity: -10 } }); // ✓ Thành công
await Order.create({ ... });                                        // ✓ Thành công
await User.updateOne({ _id: userId }, { $inc: { "vouchers.$.quantity": -1 } }); // ❌ LỖI!

// Kết quả: Stock đã trừ, Order đã tạo, nhưng Voucher KHÔNG trừ
// → Dữ liệu KHÔNG NHẤT QUÁN!

// ✅ CÓ TRANSACTION
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Product.updateOne({ _id: id }, { $inc: { quantity: -10 } }, { session });
  await Order.create([{ ... }], { session });
  await User.updateOne({ ... }, { session });

  await session.commitTransaction(); // ← TẤT CẢ hoặc KHÔNG GÌ
} catch (error) {
  await session.abortTransaction(); // ← ROLLBACK tất cả
  throw error;
}
```

**Khi nào cần Transaction?**

- ✅ Update nhiều collections
- ✅ Business logic phức tạp (checkout, payment)
- ✅ Risk of inconsistency

### ❓ Câu 5: "Có vấn đề bảo mật nào không?"

**Trả lời về các vấn đề đã xử lý:**

| Lỗ hổng                     | Cách khắc phục                         |
| --------------------------- | -------------------------------------- |
| **Password Leak**           | Bcrypt hash + `select: false`          |
| **JWT Theft (XSS)**         | httpOnly cookie cho refresh token      |
| **SQL Injection**           | Mongoose escape queries                |
| **Price Manipulation**      | Luôn lấy giá từ DB, không tin frontend |
| **Fake Payment Webhook**    | Verify signature HMAC-SHA256           |
| **Race Condition**          | Atomic updates với conditions          |
| **Double Spending Voucher** | Atomic voucher deduction               |
| **CSRF**                    | SameSite: Strict cookie                |
| **XSS**                     | sanitize-html cho blog content         |

**Cải tiến thêm (TODO):**

- ✅ Rate limiting (express-rate-limit)
- ✅ Helmet.js (security headers)
- ✅ Input validation library (Joi, express-validator)
- ✅ OWASP security checklist

### ❓ Câu 6: "Scalability - Hệ thống có scale được không?"

**Trả lời:**

**Hiện tại:**

- ✅ Stateless API (dễ horizontal scaling)
- ✅ JWT tokens (không cần session store)
- ✅ MongoDB connection pooling
- ❌ Chưa có caching (Redis)
- ❌ Chưa có load balancer
- ❌ Chưa có queue system

**Để scale lên 100,000 users/day:**

1. **Caching Layer (Redis)**

   ```javascript
   const getProduct = async (id) => {
     // Check cache first
     const cached = await redis.get(`product:${id}`);
     if (cached) return JSON.parse(cached);

     // Cache miss → Query DB
     const product = await Product.findById(id);
     await redis.setex(`product:${id}`, 3600, JSON.stringify(product));
     return product;
   };
   ```

2. **Queue System (Bull/AWS SQS)**

   ```javascript
   // Xử lý email async
   await emailQueue.add("send-order-confirmation", { orderId, email });
   ```

3. **Database Indexing**

   ```javascript
   productSchema.index({ name: "text", tags: "text" }); // Full-text search
   productSchema.index({ category: 1, price: 1 }); // Compound index
   orderSchema.index({ customer: 1, orderStatus: 1 }); // Query optimization
   ```

4. **CDN for Static Assets**
   - Cloudinary CDN cho product images

5. **Load Balancer**
   - Nginx/AWS ALB phân tải request

### ❓ Câu 7: "Tại sao lại có Point pending? Tại sao không cộng điểm ngay?"

**Trả lời:**

**Vấn đề nếu cộng điểm ngay:**

```
USER ĐẶT HÀNG
↓
CỘNG ĐIỂM NGAY → balance += 100
↓
USER SỬ DỤNG ĐIỂM → balance -= 100
↓
USER HỦY ĐƠN HÀNG
↓
??? Làm sao lấy lại điểm đã tiêu?
```

**Giải pháp: Pending Points**

```
USER ĐẶT HÀNG
↓
CỘNG PENDING → pendingPoints += 100 (chưa dùng được)
↓
ORDER DELIVERED
↓
CONFIRM PENDING → balance += 100, pendingPoints -= 100 (dùng được)
↓
Nếu HỦY ĐƠN → Chỉ cần trừ pendingPoints (không ảnh hưởng balance)
```

**Lợi ích:**

- ✅ Chống fraud (đặt hàng → lấy điểm → hủy)
- ✅ Rõ ràng về điểm khả dụng vs điểm chờ
- ✅ Audit trail tốt hơn

---

## 📝 TÓM TẮT KIẾN TRÚC

### 🎯 5 Điểm Quan Trọng Nhất

1. **MVC + Services Architecture**
   - Controller: Business logic
   - Service: Reusable logic
   - Model: Data schema
   - Middleware: Security

2. **Transaction Management**
   - MongoDB ACID transactions
   - Atomic updates
   - All-or-nothing guarantee

3. **Authentication & Authorization**
   - JWT: Access (15m) + Refresh (7d)
   - Role-based access control
   - httpOnly cookies

4. **Payment Integration**
   - MoMo, VNPay webhooks
   - Signature verification
   - Idempotency checks

5. **Loyalty System**
   - Pending points mechanism
   - Point lifecycle management
   - Reward redemption

---

## 🚀 HƯỚNG PHÁT TRIỂN

### Phase 1: Optimization

- [ ] Redis caching
- [ ] Database indexing
- [ ] Query optimization
- [ ] Image optimization (WebP)

### Phase 2: Features

- [ ] Wishlist notifications
- [ ] Product recommendations (AI)
- [ ] Advanced search (Elasticsearch)
- [ ] Multi-language support

### Phase 3: Scalability

- [ ] Microservices architecture
- [ ] Message queue (RabbitMQ)
- [ ] Load balancing
- [ ] Monitoring (Prometheus, Grafana)

---

**🎓 CHÚC BẠN BẢO VỆ THÀNH CÔNG!**

_File này cung cấp cái nhìn toàn diện về kiến trúc backend. Kết hợp với 2 file phân tích chi tiết trước đó, bạn sẽ có đầy đủ kiến thức để trả lời mọi câu hỏi từ hội đồng!_
