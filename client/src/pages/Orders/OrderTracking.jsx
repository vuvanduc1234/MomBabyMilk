// src/pages/Orders/OrderTracking.jsx
import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

// Dữ liệu mẫu đơn hàng
const mockOrders = [
  {
    id: "ORD001",
    orderNumber: "MB2024001",
    status: "delivered",
    customerName: "Nguyễn Thị Lan",
    phone: "0901234567",
    email: "lannt@email.com",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    totalAmount: 1250000,
    items: [
      { name: "Similac Mom IQ Plus", quantity: 2, price: 580000 },
      { name: "Abbott Grow Gold", quantity: 1, price: 450000 },
    ],
    shippingAddress: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    timeline: [
      {
        status: "Đơn hàng đã được đặt",
        date: "15/01/2024 10:30",
        completed: true,
      },
      {
        status: "Đã xác nhận đơn hàng",
        date: "15/01/2024 11:00",
        completed: true,
      },
      {
        status: "Đang chuẩn bị hàng",
        date: "16/01/2024 09:00",
        completed: true,
      },
      { status: "Đang vận chuyển", date: "17/01/2024 08:00", completed: true },
      { status: "Đã giao hàng", date: "18/01/2024 14:30", completed: true },
    ],
  },
  {
    id: "ORD002",
    orderNumber: "MB2024002",
    status: "shipping",
    customerName: "Trần Văn Minh",
    phone: "0912345678",
    email: "minhtv@email.com",
    orderDate: "2024-01-20",
    deliveryDate: null,
    totalAmount: 720000,
    items: [{ name: "Frisomum Gold", quantity: 1, price: 720000 }],
    shippingAddress: "456 Lê Văn Việt, Quận 9, TP.HCM",
    timeline: [
      {
        status: "Đơn hàng đã được đặt",
        date: "20/01/2024 14:20",
        completed: true,
      },
      {
        status: "Đã xác nhận đơn hàng",
        date: "20/01/2024 15:00",
        completed: true,
      },
      {
        status: "Đang chuẩn bị hàng",
        date: "21/01/2024 10:00",
        completed: true,
      },
      { status: "Đang vận chuyển", date: "22/01/2024 08:30", completed: true },
      { status: "Đã giao hàng", date: null, completed: false },
    ],
    shippingInfo: {
      carrier: "Giao Hàng Nhanh",
      trackingNumber: "GHN123456789",
      estimatedDelivery: "23/01/2024",
    },
  },
  {
    id: "ORD003",
    orderNumber: "MB2024003",
    status: "processing",
    customerName: "Lê Thị Hương",
    phone: "0923456789",
    email: "huonglt@email.com",
    orderDate: "2024-01-22",
    deliveryDate: null,
    totalAmount: 1180000,
    items: [
      { name: "Meiji Infant Formula", quantity: 1, price: 680000 },
      { name: "Nestlé NAN Optipro", quantity: 1, price: 495000 },
    ],
    shippingAddress: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    timeline: [
      {
        status: "Đơn hàng đã được đặt",
        date: "22/01/2024 16:45",
        completed: true,
      },
      {
        status: "Đã xác nhận đơn hàng",
        date: "22/01/2024 17:00",
        completed: true,
      },
      {
        status: "Đang chuẩn bị hàng",
        date: "23/01/2024 09:00",
        completed: true,
      },
      { status: "Đang vận chuyển", date: null, completed: false },
      { status: "Đã giao hàng", date: null, completed: false },
    ],
  },
];

const getStatusInfo = (status) => {
  const statusMap = {
    pending: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      icon: Clock,
      iconColor: "text-yellow-600",
    },
    processing: {
      label: "Đang xử lý",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: Package,
      iconColor: "text-blue-600",
    },
    shipping: {
      label: "Đang giao hàng",
      color: "bg-purple-100 text-purple-700 border-purple-300",
      icon: Truck,
      iconColor: "text-purple-600",
    },
    delivered: {
      label: "Đã giao hàng",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle,
      iconColor: "text-green-600",
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: XCircle,
      iconColor: "text-red-600",
    },
  };
  return statusMap[status] || statusMap.pending;
};

const formatVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function OrderTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSearch = () => {
    const order = mockOrders.find(
      (o) => o.orderNumber.toLowerCase() === searchQuery.toLowerCase(),
    );
    setSelectedOrder(order || null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">Theo dõi đơn hàng</span>
          </p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Theo dõi đơn hàng
          </h1>
          <p className="text-gray-600">
            Nhập mã đơn hàng để kiểm tra trạng thái giao hàng
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập mã đơn hàng (VD: MB2024001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-pink-400 text-white font-medium rounded-full hover:bg-pink-500 transition-colors shadow-md"
            >
              Tra cứu
            </button>
          </div>

          {/* Quick Access Orders */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Đơn hàng mẫu để test:</p>
            <div className="flex flex-wrap gap-2">
              {mockOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSearchQuery(order.orderNumber);
                    setSelectedOrder(order);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-pink-50 text-sm text-gray-700 hover:text-pink-600 rounded-full border border-gray-200 hover:border-pink-300 transition-all"
                >
                  {order.orderNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* No Search Result */}
        {searchQuery && !selectedOrder && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-gray-600 max-w-md">
                Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hotline{" "}
                <span className="text-pink-600 font-semibold">1900 xxxx</span>{" "}
                để được hỗ trợ
              </p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Đơn hàng #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày đặt: {selectedOrder.orderDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusInfo = getStatusInfo(selectedOrder.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon
                          className={`h-6 w-6 ${statusInfo.iconColor}`}
                        />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số điện thoại</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedOrder.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedOrder.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Timeline */}
              <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  Trạng thái đơn hàng
                </h3>
                <div className="space-y-6">
                  {selectedOrder.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-pink-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        {index < selectedOrder.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              step.completed ? "bg-pink-300" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4
                          className={`font-semibold mb-1 ${
                            step.completed ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {step.status}
                        </h4>
                        {step.date && (
                          <p className="text-sm text-gray-500">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                {selectedOrder.shippingInfo && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Thông tin vận chuyển
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Đơn vị vận chuyển:
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedOrder.shippingInfo.carrier}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mã vận đơn:</span>
                        <span className="font-mono font-medium text-pink-600">
                          {selectedOrder.shippingInfo.trackingNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dự kiến giao:</span>
                        <span className="font-medium text-gray-800">
                          {selectedOrder.shippingInfo.estimatedDelivery}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-gray-500">SL: {item.quantity}</p>
                      </div>
                      <p className="text-gray-800 font-semibold">
                        {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="text-gray-800">
                        {formatVND(selectedOrder.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="text-green-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">Tổng cộng:</span>
                      <span className="text-pink-600">
                        {formatVND(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button className="w-full py-2.5 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
                    Liên hệ hỗ trợ
                  </button>
                  {selectedOrder.status === "delivered" && (
                    <button className="w-full py-2.5 border-2 border-pink-400 text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-colors">
                      Đánh giá đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!selectedOrder && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Cần hỗ trợ?
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Hotline</h4>
                <p className="text-pink-600 font-semibold">1900 xxxx</p>
                <p className="text-xs text-gray-500 mt-1">
                  8:00 - 22:00 hàng ngày
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                <p className="text-pink-600 font-semibold">
                  support@mombaby.vn
                </p>
                <p className="text-xs text-gray-500 mt-1">Phản hồi trong 24h</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">FAQ</h4>
                <p className="text-gray-600">Câu hỏi thường gặp</p>
                <p className="text-xs text-gray-500 mt-1">Hướng dẫn chi tiết</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
