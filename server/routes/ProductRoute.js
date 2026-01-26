const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, deleteProduct, viewProduct, getProductsById, getProductsByCategory, getProductsByBrand} = require("../controllers/ProductController")

router.get("/", viewProduct);
router.get("/:id", getProductsById);
router.get("/category/:id", getProductsByCategory);
router.get("/brand/:id", getProductsByBrand);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
