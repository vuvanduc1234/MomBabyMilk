const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist,
} = require("../controllers/WishlistController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Tất cả routes wishlist yêu cầu authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Lấy danh sách wishlist của user
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy wishlist thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/", getWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Thêm sản phẩm vào wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm vào wishlist thành công
 *       400:
 *         description: Thiếu productId
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post("/", addToWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa khỏi wishlist thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.delete("/:productId", removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/clear:
 *   delete:
 *     summary: Xóa tất cả sản phẩm khỏi wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa tất cả thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.delete("/clear/all", clearWishlist);

/**
 * @swagger
 * /api/wishlist/check/{productId}:
 *   get:
 *     summary: Kiểm tra sản phẩm có trong wishlist không
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kiểm tra thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get("/check/:productId", checkInWishlist);

module.exports = router;
