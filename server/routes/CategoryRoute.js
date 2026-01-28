const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/CategoryController");

const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAllCategories);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get("/:id", getCategoryById);

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
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
 *         description: Category created
 */
router.post("/", authenticateToken, createCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
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
 *         description: Category updated
 */
router.patch("/:id", authenticateToken, updateCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete("/:id", authenticateToken, deleteCategory);

module.exports = router;
