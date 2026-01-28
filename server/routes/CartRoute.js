const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/CartController");

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Quản lý giỏ hàng
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy giỏ hàng của user đang đăng nhập
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin giỏ hàng
 */
router.get("/", authenticateToken, getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "65abc123456"
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Thêm thành công
 */
router.post("/add", authenticateToken, addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   patch:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "65abc123456"
 *               quantity:
 *                 type: number
 *                 example: 2
 *                 description: Số lượng mới (nếu <= 0 sẽ xóa sản phẩm)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/update", authenticateToken, updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65abc123456"
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/remove/:productId", authenticateToken, removeCartItem);

module.exports = router;
