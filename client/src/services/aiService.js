import axios from "../lib/axios";

const AI_BASE_URL = "/api/ai";

export const aiService = {
  /**
   * Send a chat message to AI
   */
  async chat(message, userId = null, sessionId = null, metadata = {}) {
    try {
      const response = await axios.post(`${AI_BASE_URL}/chat`, {
        message,
        userId,
        sessionId,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error("Error chatting with AI:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get chat history by session ID
   */
  async getChatHistory(sessionId) {
    try {
      const response = await axios.get(`${AI_BASE_URL}/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all chat histories for a user
   */
  async getUserChatHistories(userId) {
    try {
      const response = await axios.get(`${AI_BASE_URL}/history/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user chat histories:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete chat history
   */
  async deleteChatHistory(sessionId) {
    try {
      const response = await axios.delete(
        `${AI_BASE_URL}/history/${sessionId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting chat history:", error);
      throw error.response?.data || error;
    }
  },
};
