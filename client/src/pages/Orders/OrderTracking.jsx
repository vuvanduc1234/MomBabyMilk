// src/pages/Orders/OrderHistory.jsx
import { useState } from "react";
import { ChevronUp, ChevronDown, Clock, CircleDot } from "lucide-react";

// Dữ liệu mẫu đơn hàng
const mockOrderHistory = [
  {
    id: "1",
    orderNumber: "#5SC8E2A9",
    datePlaced: "23 Tháng 11, 2025",
    totalAmount: "1.250.000đ",
    paymentMethod: "COD",
    status: "pending",
    statusLabel: "Chờ xác nhận",
    processingStatus: "processing",
    processingLabel: "Đang xử lý",
    shippingAddress: "27/2a đường số 2, Quận 7, TP.HCM",
    contact: "012345563",
    items: [
      {
        id: "1",
        name: "Similac Mom IQ Plus Hương Vani",
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
        danhMuc: "Sữa cho mẹ bầu",
        dungTich: "900g",
        quantity: 2,
        price: "625.000đ",
        totalPrice: "1.250.000đ tổng",
      },
    ],
    isExpanded: false,
  },
  {
    id: "2",
    orderNumber: "#7DA9F3B2",
    datePlaced: "20 Tháng 11, 2025",
    totalAmount: "2.340.000đ",
    paymentMethod: "Thẻ tín dụng",
    status: "shipping",
    statusLabel: "Đang giao hàng",
    processingStatus: "packed",
    processingLabel: "Đã đóng gói",
    shippingAddress: "123 Lê Văn Việt, Quận 9, TP.HCM",
    contact: "0987654321",
    items: [
      {
        id: "1",
        name: "Enfamama A+ Chocolate 800g",
        image:
          "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
        danhMuc: "Sữa cho mẹ bầu",
        dungTich: "800g",
        quantity: 3,
        price: "780.000đ",
        totalPrice: "2.340.000đ tổng",
      },
    ],
    isExpanded: false,
  },
  {
    id: "3",
    orderNumber: "#2BC5D1E8",
    datePlaced: "15 Tháng 11, 2025",
    totalAmount: "1.890.000đ",
    paymentMethod: "Chuyển khoản",
    status: "delivered",
    statusLabel: "Đã giao hàng",
    processingStatus: "completed",
    processingLabel: "Hoàn thành",
    shippingAddress: "456 Nguyễn Văn Linh, Quận 7, TP.HCM",
    contact: "0912345678",
    items: [
      {
        id: "1",
        name: "Aptamil Essensis Số 1 (0-6 tháng)",
        image:
          "https://images.unsplash.com/photo-1632667916957-a0e37dbcf01d?w=400",
        danhMuc: "Sữa cho bé",
        dungTich: "800g",
        quantity: 2,
        price: "945.000đ",
        totalPrice: "1.890.000đ tổng",
      },
    ],
    isExpanded: false,
  },
  {
    id: "4",
    orderNumber: "#8FE2C9A1",
    datePlaced: "10 Tháng 11, 2025",
    totalAmount: "3.200.000đ",
    paymentMethod: "COD",
    status: "delivered",
    statusLabel: "Đã giao hàng",
    processingStatus: "completed",
    processingLabel: "Hoàn thành",
    shippingAddress: "89 Võ Văn Ngân, Thủ Đức, TP.HCM",
    contact: "0901234567",
    items: [
      {
        id: "1",
        name: "NAN Optipro Số 3 (1-2 tuổi)",
        image:
          "https://images.unsplash.com/photo-1608181830859-84eb97b9e293?w=400",
        danhMuc: "Sữa cho bé",
        dungTich: "900g",
        quantity: 4,
        price: "800.000đ",
        totalPrice: "3.200.000đ tổng",
      },
    ],
    isExpanded: false,
  },
  {
    id: "5",
    orderNumber: "#3AC7D2F5",
    datePlaced: "05 Tháng 11, 2025",
    totalAmount: "2.180.000đ",
    paymentMethod: "Chuyển khoản",
    status: "delivered",
    statusLabel: "Đã giao hàng",
    processingStatus: "completed",
    processingLabel: "Hoàn thành",
    shippingAddress: "234 Phan Văn Trị, Bình Thạnh, TP.HCM",
    contact: "0923456789",
    items: [
      {
        id: "1",
        name: "Frisolac Gold Số 2 (6-12 tháng)",
        image:
          "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400",
        danhMuc: "Sữa cho bé",
        dungTich: "850g",
        quantity: 2,
        price: "1.090.000đ",
        totalPrice: "2.180.000đ tổng",
      },
    ],
    isExpanded: false,
  },
];

const getStatusStyle = (status) => {
  const statusStyles = {
    pending: "bg-orange-50 text-orange-600 border-orange-200",
    shipping: "bg-blue-50 text-blue-600 border-blue-200",
    delivered: "bg-green-50 text-green-600 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  return statusStyles[status] || statusStyles.pending;
};

const getProcessingStyle = (status) => {
  const styles = {
    processing: "bg-orange-50 text-orange-600",
    packed: "bg-blue-50 text-blue-600",
    completed: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-600",
  };
  return styles[status] || styles.processing;
};

export default function OrderHistory() {
  const [orders, setOrders] = useState(mockOrderHistory);

  const toggleOrderExpand = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, isExpanded: !order.isExpanded }
          : order,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch sử đơn hàng
          </h1>
          <p className="text-gray-600">
            Kiểm tra trạng thái đơn hàng gần đây, quản lý đổi trả và khám phá
            sản phẩm tương tự.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8 flex-1">
                    {/* Order Number */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Mã đơn hàng
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                    </div>

                    {/* Date Placed */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ngày đặt
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {order.datePlaced}
                      </p>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Tổng tiền
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {order.totalAmount}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Thanh toán
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusStyle(order.status)}`}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {order.statusLabel}
                      </span>
                    </div>

                    {/* Processing Status Badge */}
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${getProcessingStyle(order.processingStatus)}`}
                    >
                      <CircleDot className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {order.processingLabel}
                      </span>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Toggle order details"
                    >
                      {order.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items (Expandable) */}
              {order.isExpanded && (
                <div className="bg-white">
                  {/* Order Items Section */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Sản phẩm ({order.items.length})
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Danh mục:{" "}
                                <span className="font-medium text-gray-900">
                                  {item.danhMuc}
                                </span>
                              </span>
                              <span>
                                Dung tích:{" "}
                                <span className="font-medium text-gray-900">
                                  {item.dungTich}
                                </span>
                              </span>
                              <span>
                                SL:{" "}
                                <span className="font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Price Info */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {item.price}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.totalPrice}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="px-6 py-5 bg-blue-50">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          Địa chỉ giao hàng
                        </h4>
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress || "27/2a đường số 2"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Liên hệ: {order.contact || "012345563"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State (if no orders) */}
        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu mua sắm để xem lịch sử đơn hàng của bạn tại đây
            </p>
            <button className="px-8 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
              Bắt đầu mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
