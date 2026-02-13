const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/auth");
const {
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery,
} = require("../controllers/OrderController");

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get my orders (logged-in user)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, shipped, delivered, cancelled]
 *         description: Filter by order status (optional - if not provided, returns all orders)
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 */
router.get("/my-orders", authenticateToken, getMyOrders);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin/Staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, shipped, delivered, cancelled]
 *         description: Filter by order status (optional)
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *         description: Filter by payment status (optional)
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cod, momo, vnpay]
 *         description: Filter by payment method (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by phone or shipping address (optional)
 *     responses:
 *       200:
 *         description: List of all orders (returns all if no filter provided)
 *       403:
 *         description: Forbidden - Admin/Staff only
 */
router.get("/", authenticateToken, checkRole(["Admin", "Staff"]), getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 */
router.get("/:id", authenticateToken, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin/Staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [processing, shipped, delivered, cancelled]
 *                 description: New order status
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *                 description: New payment status
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status or cannot update cancelled order
 *       403:
 *         description: Forbidden - Admin/Staff only
 *       404:
 *         description: Order not found
 */
router.patch(
  "/:id/status",
  authenticateToken,
  checkRole(["Admin", "Staff"]),
  updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *                 example: "Đặt nhầm sản phẩm"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel order (already cancelled/delivered or wrong status)
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 */
router.patch("/:id/cancel", authenticateToken, cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/confirm-delivery:
 *   patch:
 *     summary: Confirm order delivery (User only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order delivery confirmed
 *       400:
 *         description: Can only confirm shipped orders
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 */
router.patch("/:id/confirm-delivery", authenticateToken, confirmDelivery);

module.exports = router;
