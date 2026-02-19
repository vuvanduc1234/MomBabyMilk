// src/pages/Orders/OrderTracking.jsx
import { useState, useEffect, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  Clock,
  CircleDot,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyOrders,
  formatVND,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "../../services/orderService";
import { toast } from "sonner";

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải đơn hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders khi component mount
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
      toast.error("Vui lòng đăng nhập để xem đơn hàng");
    }
  }, [user, fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header với thông tin user */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Theo dõi đơn hàng
          </h1>
          {user && (
            <div className="bg-white rounded-lg p-6 mt-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Thông tin tài khoản
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.name || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.email || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.address || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8 flex-1">
                      {/* Order ID */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Mã đơn hàng
                        </p>
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          {order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày đặt
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Total */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Tổng tiền
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatVND(order.totalAmount)}
                        </p>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Thanh toán
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : order.paymentMethod === "momo"
                              ? "MoMo"
                              : "VNPay"}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-full ${getOrderStatusColor(order.orderStatus)}`}
                      >
                        <span className="text-sm font-medium">
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {expandedOrders[order._id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {expandedOrders[order._id] && (
                  <div className="bg-white">
                    {/* Order Items */}
                    <div className="px-6 py-5 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Sản phẩm ({order.cartItems?.length || 0})
                      </h3>

                      <div className="space-y-4">
                        {order.cartItems?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                              {item.product?.imageUrl &&
                              item.product.imageUrl.length > 0 ? (
                                <img
                                  src={
                                    Array.isArray(item.product.imageUrl)
                                      ? item.product.imageUrl[0]
                                      : item.product.imageUrl
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-full h-full p-4 text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {item.name}
                              </h4>
                              <div className="text-sm text-gray-600">
                                Số lượng:{" "}
                                <span className="font-medium">
                                  {item.quantity}
                                </span>
                                {" • "}
                                Đơn giá:{" "}
                                <span className="font-medium">
                                  {formatVND(item.price)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatVND(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="px-6 py-5 bg-blue-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Thông tin giao hàng
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Người nhận:</span>{" "}
                          {user?.name || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Số điện thoại:</span>{" "}
                          {order.phone || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span>{" "}
                          {user?.email || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {order.shippingAddress || "N/A"}
                        </p>
                        {order.note && (
                          <p className="text-gray-700">
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {order.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu mua sắm để theo dõi đơn hàng của bạn tại đây
            </p>
            <button
              onClick={() => (window.location.href = "/products")}
              className="px-8 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors"
            >
              Bắt đầu mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
