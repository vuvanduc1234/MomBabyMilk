const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        imageUrl: { type: String },

        isPreOrder: {
          type: Boolean,
          default: false,
          description: "True nếu item này là đặt trước",
        },

        expectedAvailableDate: {
          type: Date,
          description: "Ngày dự kiến có hàng (chỉ có khi isPreOrder = true)",
        },

        itemStatus: {
          type: String,
          enum: ["available", "preorder_pending", "preorder_ready", "shipped"],
          default: "available",
          description: "Trạng thái riêng của từng item trong đơn",
        },
      },
    ],

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },

    totalAmount: { type: Number, required: true },

    hasPreOrderItems: {
      type: Boolean,
      default: false,
      description: "Đánh dấu đơn hàng có chứa pre-order",
    },

    preOrderNote: {
      type: String,
      trim: true,
      description: "Ghi chú về pre-order cho khách",
    },

    voucherUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "cod"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "partially_shipped",
        "pending_payment",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "processing",
      description: "Hỗ trợ giao hàng từng phần với partially_shipped",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
