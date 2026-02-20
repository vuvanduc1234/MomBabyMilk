import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import {
  getMyOrders,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel,
  formatVND,
  cancelOrder,
} from "../../../services/orderService";
import { toast } from "sonner";

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const status = selectedStatus === "all" ? null : selectedStatus;
      const response = await getMyOrders(status);
      setOrders(response.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrder(orderId, "Khách hàng yêu cầu hủy");
      toast.success("Đã hủy đơn hàng thành công");
      fetchOrders(); // Reload orders
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Không thể hủy đơn hàng");
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
    { value: "processing", label: "Đang xử lý", icon: Clock },
    { value: "shipped", label: "Đang giao", icon: Truck },
    { value: "delivered", label: "Đã giao", icon: CheckCircle },
    { value: "cancelled", label: "Đã hủy", icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#2b2730]">
          Đơn hàng của tôi
        </h2>
        <p className="text-[13px] text-[#8b7b84] mt-1">
          Quản lý và theo dõi đơn hàng của bạn
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
      {orders.length === 0 ? (
        <div className="border border-dashed border-[#f1d4e0] rounded-[12px] p-6 text-center text-[14px] text-[#8b7b84]">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order._id);
            return (
              <div
                key={order._id}
                className="bg-white rounded-[12px] border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">
                        Mã đơn:{" "}
                        <span className="font-semibold text-gray-800">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </p>
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
                      .map((item, idx) => (
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
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            {formatVND(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}

                    {!isExpanded && order.cartItems.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{order.cartItems.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Expand Button */}
                  {order.cartItems.length > 2 && (
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="w-full mt-3 py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          Thu gọn <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Xem thêm <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="text-gray-800">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tổng cộng:</span>
                      <span className="text-lg font-bold text-pink-600">
                        {formatVND(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {order.orderStatus === "processing" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                      >
                        Hủy đơn
                      </button>
                    )}
                    <button
                      className="flex-1 py-2 bg-pink-100 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-200 transition"
                      onClick={() =>
                        (window.location.href = `/orders/${order._id}`)
                      }
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
