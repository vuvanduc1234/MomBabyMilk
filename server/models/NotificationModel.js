const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "order_created", // Đặt hàng thành công
        "order_status_changed", // Trạng thái đơn hàng thay đổi
        "preorder_ready", // Hàng đặt trước đã về
        "payment_success", // Thanh toán thành công
        "payment_failed", // Thanh toán thất bại
        "order_delivered", // Đơn hàng đã giao
        "order_cancelled", // Đơn hàng bị hủy
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      description: "Additional data (orderNumber, status, etc.)",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    link: {
      type: String,
      description: "URL to navigate when clicked (e.g., /orders/detail/123)",
    },
  },
  { timestamps: true },
);

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
