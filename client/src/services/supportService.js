// src/services/supportService.js
import axiosInstance from "../lib/axios";

/**
 * Tạo ticket hỗ trợ mới (chỉ User)
 * @param {{ subject: string, firstMessage: string }} data
 */
export const createConversation = async (data) => {
  try {
    const response = await axiosInstance.post("/api/support/conversations", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách conversations
 * @param {{ unassigned?: boolean, status?: string, page?: number, limit?: number }} params
 */
export const getConversations = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/support/conversations", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy chi tiết một conversation
 * @param {string} id
 */
export const getConversationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/support/conversations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Staff nhận (assign) ticket
 * @param {string} id
 */
export const assignConversation = async (id) => {
  try {
    const response = await axiosInstance.patch(`/api/support/conversations/${id}/assign`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy tin nhắn trong conversation
 * @param {string} id
 * @param {{ page?: number, limit?: number }} params
 */
export const getMessages = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `/api/support/conversations/${id}/messages`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Gửi tin nhắn
 * @param {string} id
 * @param {string} content
 */
export const sendMessage = async (id, content) => {
  try {
    const response = await axiosInstance.post(
      `/api/support/conversations/${id}/messages`,
      { content }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Staff cập nhật trạng thái ticket
 * @param {string} id
 * @param {'open'|'in_progress'|'resolved'} status
 */
export const updateStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(
      `/api/support/conversations/${id}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * User đóng ticket
 * @param {string} id
 */
export const closeConversation = async (id) => {
  try {
    const response = await axiosInstance.patch(
      `/api/support/conversations/${id}/close`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


