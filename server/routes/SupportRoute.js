const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/auth");
const {
  createConversation,
  getConversations,
  getConversationById,
  assignConversation,
  getMessages,
  sendMessage,
  updateStatus,
  closeConversation,
} = require("../controllers/SupportController");

// All routes require login
router.use(authenticateToken);

// ─── Conversations ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/support/conversations:
 *   post:
 *     summary: Tạo ticket hỗ trợ mới
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, firstMessage]
 *             properties:
 *               subject:
 *                 type: string
 *               firstMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket tạo thành công
 */
router.post("/conversations", createConversation);

/**
 * @swagger
 * /api/support/conversations:
 *   get:
 *     summary: Danh sách ticket (Staff/Admin xem tất cả, User xem của mình)
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unassigned
 *         schema:
 *           type: boolean
 *         description: Chỉ trả về ticket chưa assign (Staff)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Danh sách ticket
 */
router.get("/conversations", getConversations);

/**
 * @swagger
 * /api/support/conversations/{id}:
 *   get:
 *     summary: Chi tiết một ticket
 *     tags: [Support]
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
 *         description: Chi tiết ticket
 */
router.get("/conversations/:id", getConversationById);

/**
 * @swagger
 * /api/support/conversations/{id}/assign:
 *   patch:
 *     summary: Staff nhận ticket
 *     tags: [Support]
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
 *         description: Đã assign
 */
router.patch(
  "/conversations/:id/assign",
  checkRole(["Staff", "Admin"]),
  assignConversation,
);

/**
 * @swagger
 * /api/support/conversations/{id}/status:
 *   patch:
 *     summary: Staff cập nhật trạng thái ticket
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved]
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.patch(
  "/conversations/:id/status",
  checkRole(["Staff", "Admin"]),
  updateStatus,
);

/**
 * @swagger
 * /api/support/conversations/{id}/close:
 *   patch:
 *     summary: User đóng ticket
 *     tags: [Support]
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
 *         description: Đã đóng
 */
router.patch("/conversations/:id/close", closeConversation);

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/support/conversations/{id}/messages:
 *   get:
 *     summary: Lấy tin nhắn trong ticket
 *     tags: [Support]
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
 *         description: Danh sách tin nhắn
 */
router.get("/conversations/:id/messages", getMessages);

/**
 * @swagger
 * /api/support/conversations/{id}/messages:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tin nhắn đã gửi
 */
router.post("/conversations/:id/messages", sendMessage);

module.exports = router;
