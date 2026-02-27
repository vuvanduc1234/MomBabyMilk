const express = require("express");
const router = express.Router();
const {
  chat,
  getChatHistory,
  getUserChatHistories,
  deleteChatHistory,
} = require("../controllers/AIController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Assistant endpoints
 */

// Public routes (guests can chat)
router.post("/chat", chat);
router.get("/history/:sessionId", getChatHistory);

// Protected routes (requires authentication)
router.get("/history/user/:userId", authenticateToken, getUserChatHistories);
router.delete("/history/:sessionId", authenticateToken, deleteChatHistory);

module.exports = router;
