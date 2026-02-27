const aiService = require("../services/aiService");
const ChatHistory = require("../models/ChatHistoryModel");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI Assistant
 *     tags: [AI]
 */
const chat = async (req, res) => {
  try {
    const { message, userId, sessionId, metadata } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    // Generate session ID if not provided
    let currentSessionId = sessionId || uuidv4();

    // Call AI service
    const result = await aiService.chat(
      message,
      userId || null,
      currentSessionId,
      metadata || {},
    );

    // Save chat history to database
    let chatHistory = await ChatHistory.findOne({
      sessionId: currentSessionId,
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: userId || null,
        sessionId: currentSessionId,
        messages: [],
        metadata: metadata || {},
      });
    }

    // Add user message
    chatHistory.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Add assistant message
    chatHistory.messages.push({
      role: "assistant",
      content: result.reply,
      suggestedProducts: result.suggestedProducts.map((p) => p._id),
      timestamp: new Date(),
    });

    await chatHistory.save();

    return res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        suggestedProducts: result.suggestedProducts,
        sessionId: currentSessionId,
        context: result.context,
      },
    });
  } catch (error) {
    console.error("Error in AI chat controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu",
    });
  }
};

/**
 * @swagger
 * /api/ai/history/{sessionId}:
 *   get:
 *     summary: Get chat history by session ID
 *     tags: [AI]
 */
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatHistory = await ChatHistory.findOne({ sessionId })
      .populate({
        path: "messages.suggestedProducts",
        select: "name price imageUrl quantity",
      })
      .lean();

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch sử chat",
      });
    }

    return res.status(200).json({
      success: true,
      data: chatHistory,
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy lịch sử chat",
    });
  }
};

/**
 * @swagger
 * /api/ai/history/user/{userId}:
 *   get:
 *     summary: Get all chat histories for a user
 *     tags: [AI]
 */
const getUserChatHistories = async (req, res) => {
  try {
    const { userId } = req.params;

    const chatHistories = await ChatHistory.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select(
        "sessionId messages.role messages.content messages.timestamp updatedAt",
      )
      .lean();

    return res.status(200).json({
      success: true,
      data: chatHistories,
    });
  } catch (error) {
    console.error("Error getting user chat histories:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy lịch sử chat",
    });
  }
};

/**
 * @swagger
 * /api/ai/history/{sessionId}:
 *   delete:
 *     summary: Delete chat history
 *     tags: [AI]
 */
const deleteChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await ChatHistory.deleteOne({ sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch sử chat",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa lịch sử chat thành công",
    });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xóa lịch sử chat",
    });
  }
};

module.exports = {
  chat,
  getChatHistory,
  getUserChatHistories,
  deleteChatHistory,
};
