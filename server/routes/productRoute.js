const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "Name, price, and category are required",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
