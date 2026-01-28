// src/pages/PreOrder/PreOrderList.jsx (Updated with Checkout Integration)
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  Clock,
  CreditCard,
  Trash2,
  ArrowRight,
  Gift,
  ShoppingCart,
} from "lucide-react";
import { usePreOrder } from "../../context/PreOrderContext";

export default function PreOrderList() {
  const {
    preOrderItems,
    removeFromPreOrder,
    getPreOrdersByType,
    getTotalPreOrderPrice,
    updatePaymentOption,
  } = usePreOrder();

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const outOfStockItems = getPreOrdersByType("OUT_OF_STOCK");
  const comingSoonItems = getPreOrdersByType("COMING_SOON");

  // Đếm số sản phẩm cần thanh toán ngay
  const itemsToPayNow = preOrderItems.filter(
    (item) => item.paymentOption === "PAY_NOW",
  );

  if (preOrderItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chưa có sản phẩm đặt trước
          </h2>
          <p className="text-gray-500 mb-6">Bạn chưa đặt trước sản phẩm nào</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Khám phá sản phẩm
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-pink-600 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Đơn đặt trước</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Đơn Đặt Trước Của Bạn
        </h1>
        <p className="text-gray-600 mb-8">
          Quản lý các sản phẩm đã đặt trước và theo dõi trạng thái
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-6">
            {/* Out of Stock Pre-orders */}
            {outOfStockItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Đặt Trước - Hết Hàng ({outOfStockItems.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {outOfStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200"
                    >
                      <div className="flex gap-4">
                        {/* Hình ảnh */}
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        {/* Thông tin */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-lg font-bold text-pink-500">
                                {formatVND(item.sale_price || item.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromPreOrder(item.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Payment Option */}
                          <div className="flex items-center gap-2 mb-2">
                            {item.paymentOption === "PAY_NOW" ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                <CreditCard className="h-3 w-3" />
                                Thanh toán ngay
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                Thanh toán sau
                              </span>
                            )}
                          </div>

                          {/* Quantity & Total */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Số lượng: <strong>{item.quantity}</strong>
                            </span>
                            <span className="font-bold text-gray-800">
                              Tổng:{" "}
                              {formatVND(
                                (item.sale_price || item.price) * item.quantity,
                              )}
                            </span>
                          </div>

                          {/* Change Payment Option */}
                          {item.paymentOption === "PAY_LATER" && (
                            <button
                              onClick={() =>
                                updatePaymentOption(item.id, "PAY_NOW")
                              }
                              className="mt-2 text-xs text-pink-600 hover:text-pink-700 font-medium"
                            >
                              Chuyển sang thanh toán ngay →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coming Soon Pre-orders */}
            {comingSoonItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Đặt Trước - Sắp Ra Mắt ({comingSoonItems.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {comingSoonItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200"
                    >
                      <div className="flex gap-4">
                        {/* Hình ảnh */}
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        {/* Thông tin */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-lg font-bold text-pink-500">
                                {formatVND(item.sale_price || item.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromPreOrder(item.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Release Date */}
                          {item.releaseDate && (
                            <div className="flex items-center gap-1.5 mb-2 text-sm text-purple-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Ra mắt:{" "}
                                <strong>
                                  {new Date(
                                    item.releaseDate,
                                  ).toLocaleDateString("vi-VN")}
                                </strong>
                              </span>
                            </div>
                          )}

                          {/* Status */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Gift className="h-3 w-3" />
                              Đã đăng ký - Chưa thanh toán
                            </span>
                          </div>

                          {/* Quantity */}
                          <div className="text-sm text-gray-600">
                            Số lượng đăng ký: <strong>{item.quantity}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tóm tắt */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm Tắt</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng sản phẩm</span>
                  <span className="font-semibold">{preOrderItems.length}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Hết hàng (thanh toán ngay)</span>
                  <span className="font-semibold">
                    {
                      outOfStockItems.filter(
                        (i) => i.paymentOption === "PAY_NOW",
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Hết hàng (thanh toán sau)</span>
                  <span className="font-semibold">
                    {
                      outOfStockItems.filter(
                        (i) => i.paymentOption === "PAY_LATER",
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Sắp ra mắt (đã đăng ký)</span>
                  <span className="font-semibold">
                    {comingSoonItems.length}
                  </span>
                </div>

                {getTotalPreOrderPrice() > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">
                          Cần thanh toán
                        </span>
                        <span className="text-2xl font-bold text-pink-500">
                          {formatVND(getTotalPreOrderPrice())}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Nút Thanh Toán */}
              {itemsToPayNow.length > 0 && (
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition mb-3"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Thanh toán ({itemsToPayNow.length})
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}

              <Link
                to="/products"
                className="w-full block text-center text-pink-600 font-medium py-3 border border-pink-400 rounded-lg hover:bg-pink-50 transition"
              >
                Tiếp tục mua sắm
              </Link>

              {/* Info Box */}
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  📋 Lưu ý quan trọng
                </h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li>
                    • <strong>Thanh toán ngay:</strong> Ưu tiên giao đầu tiên
                  </li>
                  <li>
                    • <strong>Thanh toán sau:</strong> 48 giờ khi có thông báo
                  </li>
                  <li>
                    • <strong>Sắp ra mắt:</strong> Nhận thông báo khi mở bán
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
