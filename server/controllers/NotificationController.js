const Notification = require("../models/NotificationModel");

// Get user's notifications
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const query = { user: userId };
    if (unreadOnly === "true" || unreadOnly === true) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("orderId", "orderStatus totalAmount createdAt");

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.status(200).json({
      message: "Lấy thông báo thành công",
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông báo",
      error: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    res.status(200).json({
      message: "Đã đánh dấu đã đọc",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đánh dấu thông báo",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true },
    );

    res.status(200).json({
      message: "Đã đánh dấu tất cả thông báo đã đọc",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đánh dấu thông báo",
      error: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    res.status(200).json({
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa thông báo",
      error: error.message,
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đếm thông báo",
      error: error.message,
    });
  }
};

// Helper: Create notification (for internal use)
const createNotification = async ({
  userId,
  type,
  title,
  message,
  orderId = null,
  data = null,
  link = null,
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      orderId,
      data,
      link,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
};
