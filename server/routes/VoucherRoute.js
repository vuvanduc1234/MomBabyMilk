const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  createManualVoucher,
  createRandomVoucher,
  assignVoucherToUser,
  assignVoucherToAll,
  getMyVouchers,
} = require("../controllers/VoucherController");

/**
 * @swagger
 * tags:
 *   - name: Voucher
 *     description: Quản lý Voucher khuyến mãi
 */

/**
 * @swagger
 * /api/voucher/manual:
 *   post:
 *     summary: Tạo voucher thủ công (Admin)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountPercentage
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SALE20"
 *               discountPercentage:
 *                 type: number
 *                 example: 20
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59.000Z"
 *               minOrderValue:
 *                 type: number
 *                 description: Giá trị đơn hàng tối thiểu
 *                 example: 200000
 *               description:
 *                 type: string
 *                 example: "Giảm 20% cho đơn trên 200k"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/manual", authenticateToken, createManualVoucher);

/**
 * @swagger
 * /api/voucher/random:
 *   post:
 *     summary: Tạo voucher mã random (Admin)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discountPercentage
 *               - expiryDate
 *             properties:
 *               discountPercentage:
 *                 type: number
 *                 example: 15
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59.000Z"
 *               minOrderValue:
 *                 type: number
 *                 description: Giá trị đơn hàng tối thiểu
 *                 example: 100000
 *               description:
 *                 type: string
 *                 example: "Voucher ngẫu nhiên cho sự kiện"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/random", authenticateToken, createRandomVoucher);

/**
 * @swagger
 * /api/voucher/assign-user:
 *   post:
 *     summary: Tặng voucher cho 1 User cụ thể (Admin)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - voucherId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65fa1c2b..."
 *               voucherId:
 *                 type: string
 *                 example: "660ab123..."
 *               quantity:
 *                 type: number
 *                 description: Số lượng voucher muốn tặng (Mặc định 1)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Gửi thành công
 */
router.post("/assign-user", authenticateToken, assignVoucherToUser);

/**
 * @swagger
 * /api/voucher/assign-all:
 *   post:
 *     summary: Tặng voucher cho TẤT CẢ User (Admin)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *             properties:
 *               voucherId:
 *                 type: string
 *                 example: "660ab123..."
 *               quantity:
 *                 type: number
 *                 description: Số lượng voucher muốn tặng mỗi người (Mặc định 1)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Gửi thành công
 */
router.post("/assign-all", authenticateToken, assignVoucherToAll);

/**
 * @swagger
 * /api/voucher/my-vouchers:
 *   get:
 *     summary: Xem kho voucher của tôi (User)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách voucher còn hạn và còn số lượng
 */
router.get("/my-vouchers", authenticateToken, getMyVouchers);

module.exports = router;
