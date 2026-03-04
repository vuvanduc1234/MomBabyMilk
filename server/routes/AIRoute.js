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

// Protected routes (requires authentication)
router.post("/chat", authenticateToken, chat);
router.get("/history/:sessionId", authenticateToken, getChatHistory);

// Protected routes (requires authentication)
router.get("/history/user/:userId", authenticateToken, getUserChatHistories);
router.delete("/history/:sessionId", authenticateToken, deleteChatHistory);

module.exports = router;
