const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, deleteProduct, viewProduct, findByProductId} = require("../controllers/ProductController")

router.get("/", viewProduct)
router.post("/",createProduct);
router.get("/:id", findByProductId )
router.patch("/:id",updateProduct);
router.delete("/:id",deleteProduct);

module.exports = router;
