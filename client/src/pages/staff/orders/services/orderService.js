// src/services/orderService.js
import axiosInstance from "../../../../lib/axios";

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
 * Lấy tất cả đơn hàng (Admin/Staff only)
 */
export const getAllOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);
    if (filters.search) params.append("search", filters.search);
    if (filters.hasPreOrder !== undefined)
      params.append("hasPreOrder", filters.hasPreOrder);
    if (filters.itemStatus) params.append("itemStatus", filters.itemStatus);

    const url = `/api/orders${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật trạng thái đơn hàng (Admin/Staff only)
 */
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.patch(
      `/api/orders/${orderId}/status`,
      statusData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error.response?.data || error;
  }
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
    partially_shipped: "Giao một phần",
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
 * Map item status to Vietnamese
 */
export const getItemStatusLabel = (status) => {
  const statusMap = {
    available: "Có sẵn",
    preorder_pending: "Đặt trước - Chờ hàng",
    preorder_ready: "Đặt trước - Đã có hàng",
    shipped: "Đã giao",
  };
  return statusMap[status] || status;
};

/**
 * Get order status color
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300",
    processing: "bg-blue-100 text-blue-800 border-blue-300",
    shipped: "bg-purple-100 text-purple-800 border-purple-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    partially_shipped: "bg-orange-100 text-orange-800 border-orange-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status) => {
  const colorMap = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

/**
 * Format order number for display
 */
export const formatOrderNumber = (order) => {
  // If order has a readable order number, use it, otherwise format the ID
  if (order.orderNumber) return order.orderNumber;

  // Create readable order number from ID and date
  const date = new Date(order.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const shortId = order._id.slice(-6).toUpperCase();

  return `ORD-${year}${month}-${shortId}`;
};

/**
 * Get dashboard stats for staff
 */
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/api/orders");
    const orders = response.data.orders || [];

    const stats = {
      totalPendingOrders: orders.filter(
        (o) => o.orderStatus === "processing" && o.paymentStatus === "pending",
      ).length,
      totalConfirmedOrders: orders.filter(
        (o) => o.orderStatus === "processing" && o.paymentStatus === "paid",
      ).length,
      totalShippingOrders: orders.filter((o) => o.orderStatus === "shipped")
        .length,
      pendingOrders: orders
        .filter(
          (o) =>
            o.orderStatus === "processing" ||
            o.orderStatus === "pending_payment",
        )
        .slice(0, 5)
        .map((order) => ({
          id: order._id,
          order_number: formatOrderNumber(order),
          customer_name: order.customer?.fullname || "N/A",
          total: order.totalAmount,
          created_at: order.createdAt,
          status: order.orderStatus,
        })),
    };

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const response = await axiosInstance.get("/api/product");
    const products = response.data.data || response.data || [];

    const lowStockProducts = products
      .filter((p) => p.quantity <= threshold)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
      .map((product) => ({
        id: product._id,
        name: product.name,
        quantity: product.quantity,
        image_url: product.imageUrl?.[0] || "/placeholder.jpg",
        slug: product._id,
      }));

    return lowStockProducts;
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update order metadata (tracking number, internal notes)
 */
export const updateOrderMetadata = async (orderId, metadata) => {
  try {
    // For now, we'll use the status endpoint to store notes
    // You may need to add a dedicated endpoint in the backend
    const response = await axiosInstance.patch(
      `/api/orders/${orderId}/status`,
      {
        note: metadata.note,
        trackingNumber: metadata.trackingNumber,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order metadata:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get pre-order orders with optional item status filter
 */
export const getPreOrderOrders = async (itemStatus = null) => {
  try {
    const url = itemStatus
      ? `/api/orders/pre-orders?itemStatus=${itemStatus}`
      : "/api/orders/pre-orders";
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching pre-order orders:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update item status (for pre-order items)
 */
export const updateItemStatus = async (orderId, itemIndex, itemStatus) => {
  try {
    const response = await axiosInstance.patch(
      `/api/orders/${orderId}/items/${itemIndex}/status`,
      { itemStatus },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating item status:", error);
    throw error.response?.data || error;
  }
};

/**
 * Notify customer that pre-order is ready
 */
export const notifyPreOrderReady = async (orderId) => {
  try {
    const response = await axiosInstance.post(
      `/api/orders/${orderId}/notify-preorder-ready`,
    );
    return response.data;
  } catch (error) {
    console.error("Error notifying pre-order ready:", error);
    throw error.response?.data || error;
  }
};
