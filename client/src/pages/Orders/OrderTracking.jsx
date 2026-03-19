// src/pages/Orders/OrderTracking.jsx
import { useState, useEffect, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyOrders,
  formatVND,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  cancelOrder,
  confirmDelivery,
  retryPayment,
} from "../../services/orderService";
import { toast } from "sonner";

// Helper function để lấy thông tin trạng thái item
const getItemStatusInfo = (item) => {
  // Kiểm tra item có phải pre-order không
  if (item.isPreOrder) {
    // Nếu đã sẵn sàng giao hàng
    if (item.itemStatus === "preorder_ready" || item.itemStatus === "shipped") {
      return {
        label: "Đã có hàng",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: PackageCheck,
        showDate: false,
      };
    }
    // Nếu đang chờ nhập hàng
    return {
      label: "Đang chờ nhập hàng",
      color: "bg-orange-100 text-orange-700 border-orange-300",
      icon: AlertCircle,
      showDate: true,
      expectedDate: item.expectedAvailableDate,
    };
  }

  // Sản phẩm có sẵn (không phải pre-order)
  return {
    label: "Có sẵn",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: PackageCheck,
    showDate: false,
  };
};

const getCancellationReason = (order) => {
  if (order?.cancellationReason?.trim()) {
    return order.cancellationReason.trim();
  }

  // Backward compatibility: some old orders append reason into note.
  const note = order?.note || "";
  const marker = "Lý do hủy:";
  const markerIndex = note.lastIndexOf(marker);

  if (markerIndex === -1) return "";
  return note.slice(markerIndex + marker.length).trim();
};

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const status = selectedStatus === "all" ? null : selectedStatus;
      const data = await getMyOrders(status);
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
  }, [selectedStatus]);

  // Fetch orders khi component mount hoặc status thay đổi
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
      toast.error("Vui lòng đăng nhập để xem đơn hàng");
    }
  }, [user, fetchOrders, selectedStatus]);

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrder(orderId, "Khách hàng yêu cầu hủy");
      toast.success("Đã hủy đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Không thể hủy đơn hàng");
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!confirm("Xác nhận bạn đã nhận được hàng?")) return;

    try {
      await confirmDelivery(orderId);
      toast.success("Cảm ơn bạn! Đơn hàng đã được xác nhận hoàn thành");
      fetchOrders();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error(error.message || "Không thể xác nhận đã nhận hàng");
    }
  };

  const handleRetryPayment = async (orderId) => {
    try {
      const result = await retryPayment(orderId);
      if (result.paymentUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = result.paymentUrl;
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast.error(error.message || "Không thể thử lại thanh toán");
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const statusOptions = [
    { value: "all", label: "Tất cả", icon: Package },
    { value: "pending_payment", label: "Chờ thanh toán", icon: AlertCircle },
    { value: "processing", label: "Đang xử lý", icon: Clock },
    { value: "shipped", label: "Đang giao", icon: Truck },
    { value: "delivered", label: "Đã giao", icon: CheckCircle },
    { value: "cancelled", label: "Đã hủy", icon: XCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-gray-600">
            Quản lý và theo dõi đơn hàng của bạn
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedStatus === option.value
                    ? "bg-pink-100 text-pink-600 border border-pink-300"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-pink-200"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order._id);
              const cancellationReason = getCancellationReason(order);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">
                            Mã đơn:{" "}
                            <span className="font-semibold text-gray-800">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                          </p>
                          {/* Badge Pre-Order ở header */}
                          {order.hasPreOrderItems && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-300 rounded-full text-xs font-medium">
                              <Clock size={10} />
                              Pre-Order
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.cartItems
                        .slice(0, isExpanded ? undefined : 2)
                        .map((item, idx) => {
                          const statusInfo = getItemStatusInfo(item);
                          const StatusIcon = statusInfo.icon;

                          return (
                            <div key={idx} className="flex gap-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                {item.imageUrl || item.product?.imageUrl ? (
                                  <img
                                    src={
                                      Array.isArray(item.imageUrl)
                                        ? item.imageUrl[0]
                                        : item.imageUrl ||
                                          (Array.isArray(item.product?.imageUrl)
                                            ? item.product.imageUrl[0]
                                            : item.product?.imageUrl)
                                    }
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-full h-full p-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-800 truncate">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  x{item.quantity} • {formatVND(item.price)}
                                </p>
                                {/* Trạng thái sản phẩm */}
                                <div className="mt-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                  >
                                    <StatusIcon size={12} />
                                    {statusInfo.label}
                                  </span>
                                  {/* Hiển thị ngày dự kiến cho pre-order */}
                                  {statusInfo.showDate &&
                                    statusInfo.expectedDate && (
                                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <Clock size={11} />
                                        Dự kiến:{" "}
                                        {new Date(
                                          statusInfo.expectedDate,
                                        ).toLocaleDateString("vi-VN")}
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {formatVND(item.price * item.quantity)}
                              </div>
                            </div>
                          );
                        })}

                      {!isExpanded && order.cartItems.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{order.cartItems.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="w-full mt-3 py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          Ẩn chi tiết <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Xem chi tiết <ChevronDown size={16} />
                        </>
                      )}
                    </button>

                    {/* Shipping Information */}
                    {isExpanded && (
                      <>
                        {/* Thông báo Pre-order nếu có */}
                        {order.hasPreOrderItems && (
                          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle
                                className="text-orange-600 mt-0.5 flex-shrink-0"
                                size={18}
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-orange-900 mb-1">
                                  Đơn hàng có sản phẩm Pre-Order
                                </h4>
                                <p className="text-xs text-orange-700">
                                  {order.preOrderNote ||
                                    "Đơn hàng này có chứa sản phẩm đặt trước. Chúng tôi sẽ giao hàng từng phần: sản phẩm có sẵn sẽ được giao trước, sản phẩm pre-order sẽ giao khi hàng về."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Thông báo thanh toán thất bại */}
                        {(order.orderStatus === "pending_payment" ||
                          order.paymentStatus === "failed") && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <XCircle
                                className="text-red-600 mt-0.5 flex-shrink-0"
                                size={18}
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-900 mb-1">
                                  Thanh toán chưa thành công
                                </h4>
                                <p className="text-xs text-red-700">
                                  Đơn hàng của bạn đang chờ thanh toán. Vui lòng
                                  thử lại hoặc hủy đơn nếu không muốn tiếp tục.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Hiển thị lý do hủy cho đơn cancelled */}
                        {order.orderStatus === "cancelled" &&
                          cancellationReason && (
                            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <XCircle
                                  className="text-rose-600 mt-0.5 flex-shrink-0"
                                  size={18}
                                />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-rose-900 mb-1">
                                    Lý do hủy đơn
                                  </h4>
                                  <p className="text-xs text-rose-700 whitespace-pre-line">
                                    {cancellationReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Thông tin giao hàng
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Người nhận:</span>{" "}
                              {user?.name || user?.fullname || "N/A"}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">
                                Số điện thoại:
                              </span>{" "}
                              {order.phone || user?.phone || "N/A"}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Địa chỉ:</span>{" "}
                              {order.shippingAddress || user?.address || "N/A"}
                            </p>
                            {order.note && (
                              <p className="text-gray-700">
                                <span className="font-medium">Ghi chú:</span>{" "}
                                {order.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="text-gray-800">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          Trạng thái thanh toán:
                        </span>
                        <span
                          className={`font-medium ${
                            order.paymentStatus === "paid"
                              ? "text-green-600"
                              : order.paymentStatus === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Tổng cộng:
                        </span>
                        <span className="text-lg font-bold text-pink-600">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      {/* Nút thử lại thanh toán - hiện khi thanh toán thất bại hoặc pending */}
                      {(order.orderStatus === "pending_payment" ||
                        order.paymentStatus === "failed") &&
                        order.paymentMethod !== "cod" && (
                          <button
                            onClick={() => handleRetryPayment(order._id)}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                          >
                            <AlertCircle size={16} />
                            Thử lại thanh toán
                          </button>
                        )}

                      {/* Nút hủy đơn - hiện khi đơn chưa ở trạng thái Đang Giao hoặc Đã Giao */}
                      {order.orderStatus !== "shipped" &&
                        order.orderStatus !== "delivered" &&
                        order.orderStatus !== "cancelled" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="w-full py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                          >
                            Hủy đơn
                          </button>
                        )}

                      {/* Nút xác nhận đã nhận hàng - chỉ hiện khi đơn đang giao */}
                      {order.orderStatus === "shipped" && (
                        <button
                          onClick={() => handleConfirmDelivery(order._id)}
                          className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Đã nhận hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
