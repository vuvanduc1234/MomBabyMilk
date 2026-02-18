// src/services/orderService.js
import axiosInstance from "../lib/axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Tạo đơn hàng mới (checkout)
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post("/api/checkout", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 */
export const getMyOrders = async (status = null) => {
  try {
    const url = status
      ? `/api/orders/my-orders?status=${status}`
      : "/api/orders/my-orders";
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error.response?.data || error;
  }
};

/**
 * Hủy đơn hàng
 */
export const cancelOrder = async (orderId, reason = "") => {
  try {
    const response = await axiosInstance.patch(
      `/api/orders/${orderId}/cancel`,
      {
        reason,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error.response?.data || error;
  }
};

/**
 * Xác nhận đã nhận hàng
 */
export const confirmDelivery = async (orderId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/orders/${orderId}/confirm-delivery`,
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming delivery:", error);
    throw error.response?.data || error;
  }
};

/**
 * Format giá tiền VND
 */
export const formatVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Map order status to Vietnamese
 */
export const getOrderStatusLabel = (status) => {
  const statusMap = {
    pending_payment: "Chờ thanh toán",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

/**
 * Map payment status to Vietnamese
 */
export const getPaymentStatusLabel = (status) => {
  const statusMap = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
  };
  return statusMap[status] || status;
};

/**
 * Map payment method to Vietnamese
 */
export const getPaymentMethodLabel = (method) => {
  const methodMap = {
    cod: "Thanh toán khi nhận hàng (COD)",
    momo: "Ví MoMo",
    vnpay: "VNPay",
  };
  return methodMap[method] || method;
};

/**
 * Get order status color
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending_payment: "text-yellow-600 bg-yellow-50",
    processing: "text-blue-600 bg-blue-50",
    shipped: "text-orange-600 bg-orange-50",
    delivered: "text-green-600 bg-green-50",
    cancelled: "text-red-600 bg-red-50",
  };
  return colorMap[status] || "text-gray-600 bg-gray-50";
};
