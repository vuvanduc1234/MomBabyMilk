const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/NotificationController");
const { authenticateToken } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get my notifications
router.get("/", getMyNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get("/unread-count", getUnreadCount);

// PATCH /api/notifications/:id/read - Mark as read
router.patch("/:id/read", markAsRead);

// PATCH /api/notifications/read-all - Mark all as read
router.patch("/read-all", markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
