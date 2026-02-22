const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  checkout,
  momoNotify,
  vnpayReturn,
} = require("../controllers/CheckoutController");

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Checkout - Create order from cart items (Cart is stored in client localStorage)
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItems
 *             properties:
 *               cartItems:
 *                 type: array
 *                 description: Array of products from localStorage cart
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Product ID
 *                       example: "507f1f77bcf86cd799439011"
 *                     quantity:
 *                       type: number
 *                       description: Quantity to order
 *                       example: 2
 *               phone:
 *                 type: string
 *                 description: Customer phone number (optional - fallback to user profile)
 *                 example: "0912345678"
 *               shippingAddress:
 *                 type: string
 *                 description: Shipping address (optional - fallback to user profile)
 *                 example: "123 Nguyễn Huệ, Quận 1, TP.HCM"
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, momo, vnpay]
 *                 description: Payment method
 *                 default: cod
 *                 example: "vnpay"
 *               voucherUsed:
 *                 type: string
 *                 description: Optional voucher ID from user's vouchers (get list from /api/users/my-vouchers)
 *                 example: "6979fd9eebd101f6355d5b97"
 *               note:
 *                 type: string
 *                 description: Optional order note
 *                 example: "Giao giờ hành chính"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đặt hàng thành công"
 *                 order:
 *                   type: object
 *                   description: Created order details
 *                 payUrl:
 *                   type: string
 *                   description: Payment URL (for MOMO/VNPAY)
 *       400:
 *         description: Bad request - Invalid cart data, insufficient stock, or voucher error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, checkout);

// MOMO IPN Callback
router.post("/momo-ipn", momoNotify);

// VNPAY Return URL
router.get("/vnpay-return", vnpayReturn);

module.exports = router;
