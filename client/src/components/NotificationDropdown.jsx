// src/components/NotificationDropdown.jsx
import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

export default function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unread count (for polling)
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      setLoading(true);
      const data = await getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated()) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      const deletedNotif = notifications.find((n) => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_created: "🛒",
      order_status_changed: "📦",
      preorder_ready: "✅",
      payment_success: "💳",
      payment_failed: "❌",
      order_delivered: "🎉",
      order_cancelled: "🚫",
    };
    return icons[type] || "🔔";
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex flex-col items-center text-gray-600 hover:text-pink-600 transition cursor-pointer"
      >
        <Bell className="h-10 w-10" strokeWidth={1.5} />
        <span className="text-xs">Thông báo</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Content */}
          <div className="absolute top-full right-0 pt-2 z-50 w-96 max-w-[calc(100vw-2rem)]">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              {/* Arrow */}
              <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                        !notif.isRead ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif._id);
                        if (notif.link) {
                          setIsOpen(false);
                          window.location.href = notif.link;
                        }
                      }}
                    >
                      <div className="px-4 py-3 flex gap-3 relative">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium text-gray-800 ${
                              !notif.isRead ? "font-semibold" : ""
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notif.createdAt)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(notif._id, e)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Unread Indicator */}
                        {!notif.isRead && (
                          <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <Link
                    to="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium text-center block"
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
