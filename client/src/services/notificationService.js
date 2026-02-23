// src/services/notificationService.js
import axiosInstance from "../lib/axios";

/**
 * Get user's notifications
 */
export const getNotifications = async (params = {}) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = params;
    const response = await axiosInstance.get("/api/notifications", {
      params: { limit, skip, unreadOnly },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get("/api/notifications/unread-count");
    return response.data.count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error.response?.data || error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/notifications/${notificationId}/read`,
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error.response?.data || error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.patch("/api/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/notifications/${notificationId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error.response?.data || error;
  }
};
