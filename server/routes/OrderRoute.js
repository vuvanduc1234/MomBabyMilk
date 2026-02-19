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
  updateItemStatus,
  getPreOrderOrders,
  notifyPreOrderReady,
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
 *           enum: [processing, partially_shipped, shipped, delivered, cancelled]
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
 *           enum: [processing, partially_shipped, shipped, delivered, cancelled]
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
 *       - in: query
 *         name: hasPreOrder
 *         schema:
 *           type: boolean
 *         description: Filter orders with pre-order items (optional)
 *       - in: query
 *         name: itemStatus
 *         schema:
 *           type: string
 *           enum: [available, preorder_pending, preorder_ready, shipped]
 *         description: Filter by item status in cart items (optional)
 *     responses:
 *       200:
 *         description: List of all orders (returns all if no filter provided)
 *       403:
 *         description: Forbidden - Admin/Staff only
 */
router.get("/", authenticateToken, checkRole(["Admin", "Staff"]), getAllOrders);

/**
 * @swagger
 * /api/orders/pre-orders:
 *   get:
 *     summary: Get all orders with pre-order items (Staff/Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemStatus
 *         schema:
 *           type: string
 *           enum: [preorder_pending, preorder_ready]
 *         description: Filter by item status (optional)
 *     responses:
 *       200:
 *         description: List of pre-order orders
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/pre-orders",
  authenticateToken,
  checkRole(["Admin", "Staff"]),
  getPreOrderOrders
);

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
 *                 enum: [processing, partially_shipped, shipped, delivered, cancelled]
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

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemIndex}/status:
 *   patch:
 *     summary: Update item status in order (Staff/Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *       - in: path
 *         name: itemIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of item in cartItems array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemStatus:
 *                 type: string
 *                 enum: [available, preorder_pending, preorder_ready, shipped]
 *     responses:
 *       200:
 *         description: Item status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order or item not found
 */
router.patch(
  "/:orderId/items/:itemIndex/status",
  authenticateToken,
  checkRole(["Admin", "Staff"]),
  updateItemStatus
);

/**
 * @swagger
 * /api/orders/{orderId}/notify-preorder-ready:
 *   post:
 *     summary: Notify customer when pre-order items are ready (Staff/Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: No pre-order items ready
 *       404:
 *         description: Order not found
 */
router.post(
  "/:orderId/notify-preorder-ready",
  authenticateToken,
  checkRole(["Admin", "Staff"]),
  notifyPreOrderReady
);

module.exports = router;
