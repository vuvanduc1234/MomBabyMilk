const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/BrandController");

const router = express.Router();

/**
 * @swagger
 * /api/brand:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get("/", getAllBrands);

/**
 * @swagger
 * /api/brand/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand details
 */
router.get("/:id", getBrandById);

/**
 * @swagger
 * /api/brand:
 *   post:
 *     summary: Create new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Brand created
 */
router.post("/", authenticateToken, createBrand);

/**
 * @swagger
 * /api/brand/{id}:
 *   patch:
 *     summary: Update brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand updated
 */
router.patch("/:id", authenticateToken, updateBrand);

/**
 * @swagger
 * /api/brand/{id}:
 *   delete:
 *     summary: Delete brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted
 */
router.delete("/:id", authenticateToken, deleteBrand);

module.exports = router;
