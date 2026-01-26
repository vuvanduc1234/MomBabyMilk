require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const database = require("./config/db");
const AuthRoute = require("./routes/authRoute");
const UserRoute = require("./routes/UserRoute");
const ProductRoute = require("./routes/productRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const BrandRoute = require("./routes/BrandRoute");
const app = express();
database.connect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/product", ProductRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/brand", BrandRoute);

// Server setup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
