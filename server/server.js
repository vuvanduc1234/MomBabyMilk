const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const database = require("./config/db");
const { setIO } = require("./config/socket");
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const ProductRoute = require("./routes/ProductRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const BrandRoute = require("./routes/BrandRoute");
const CheckoutRoute = require("./routes/CheckoutRoute");
const VoucherRoute = require("./routes/VoucherRoute");
const UploadRoute = require("./routes/UploadRoute");
const paymentRoutes = require("./routes/PaymentRoutes");
const BlogRoute = require("./routes/BlogRoute");
const CommentRoute = require("./routes/CommentRoute");
const WishlistRoute = require("./routes/WishlistRoute");
const OrderRoute = require("./routes/OrderRoute");
const AnalyticsRoute = require("./routes/AnalyticsRoute");
const PointRoute = require("./routes/PointRoute");
const NotificationRoute = require("./routes/NotificationRoute");
const AIRoute = require("./routes/AIRoute");
const SupportRoute = require("./routes/SupportRoute");
const app = express();
const httpServer = http.createServer(app);

database.connect();

app.use(database.ensureConnection);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://mom-baby-milk-client.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/product", ProductRoute);
app.use("/api/product", CommentRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/brand", BrandRoute);
app.use("/api/checkout", CheckoutRoute);
app.use("/api/voucher", VoucherRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/blogs", BlogRoute);
app.use("/api/wishlist", WishlistRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/analytics", AnalyticsRoute);
app.use("/api/points", PointRoute);
app.use("/api/notifications", NotificationRoute);
app.use("/api/ai", AIRoute);
app.use("/api/support", SupportRoute);

app.use("/api/upload", UploadRoute);

const PORT = process.env.PORT || 3000;

// ─── Socket.IO setup ────────────────────────────────────────────────────────
const allowedOriginsForSocket = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://mom-baby-milk-client.vercel.app",
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOriginsForSocket,
    credentials: true,
  },
});

setIO(io);

/**
 * Socket.IO Authentication middleware
 * Clients must pass: { auth: { token: "<JWT>" } }
 */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new Error("Invalid token"));
    socket.user = user; // { id, role, ... }
    next();
  });
});

io.on("connection", (socket) => {
  const { id: userId, role } = socket.user;

  // Every user joins their personal room for targeted messages
  socket.join(`user:${userId}`);

  // Staff join the shared staff inbox room
  if (role === "Staff" || role === "Admin") {
    socket.join("support:staff");
  }

  /**
   * Join a specific conversation room when the user opens a chat window.
   * The server verifies the caller is actually part of this conversation.
   */
  socket.on("support:join_conversation", async (conversationId) => {
    try {
      const Conversation = require("./models/ConversationModel");
      const conv = await Conversation.findById(conversationId).lean();
      if (!conv) return;

      const isOwner = conv.user.toString() === userId;
      const isAssignedStaff =
        conv.staff && conv.staff.toString() === userId;
      const isAdmin = role === "Admin";
      const isStaff = role === "Staff" || isAdmin;

      if (isOwner || isAssignedStaff || isAdmin || (isStaff && !conv.staff)) {
        socket.join(`conversation:${conversationId}`);
      }
    } catch (_) {}
  });

  socket.on("support:leave_conversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
});

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Retrying in 3 seconds...`);
    setTimeout(() => {
      httpServer.close();
      httpServer.listen(PORT);
    }, 3000);
  } else {
    throw err;
  }
});

module.exports = app;
