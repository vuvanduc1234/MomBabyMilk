require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const database = require("./config/db");
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const ProductRoute = require("./routes/ProductRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const BrandRoute = require("./routes/BrandRoute");
const CheckoutRoute = require("./routes/CheckoutRoute");
const OrderRoute = require("./routes/OrderRoute");
const VoucherRoute = require("./routes/VoucherRoute");
const RewardRoute = require("./routes/RewardRoute");
const UploadRoute = require("./routes/UploadRoute");
const paymentRoutes = require("./routes/PaymentRoutes");
const BlogRoute = require("./routes/BlogRoute");
const CommentRoute = require("./routes/CommentRoute");
const WishlistRoute = require("./routes/WishlistRoute");
const app = express();

// Kết nối MongoDB khi start server (traditional hosting)
database
  .connect()
  .catch((err) => console.error("Initial DB connection failed:", err));

// Middleware đảm bảo connection ready cho mỗi request (Vercel serverless)
app.use(database.ensureConnection);

app.use(cors());
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
app.use("/api/orders", OrderRoute);
app.use("/api/voucher", VoucherRoute);
app.use("/api/rewards", RewardRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/blogs", BlogRoute);
app.use("/api/wishlist", WishlistRoute);

app.use("/api/upload", UploadRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
