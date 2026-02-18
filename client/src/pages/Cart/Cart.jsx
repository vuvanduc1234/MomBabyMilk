// src/pages/Cart/Cart.jsx
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  Calendar,
  Clock,
  CreditCard,
  Gift,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalPayNow,
    getRegularItems,
    getPreOrderItems,
    updatePaymentOption,
  } = useCart();

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const regularItems = getRegularItems();
  const preOrderItems = getPreOrderItems();
  const outOfStockItems = preOrderItems.filter(
    (item) => item.preOrderType === "OUT_OF_STOCK",
  );
  const comingSoonItems = preOrderItems.filter(
    (item) => item.preOrderType === "COMING_SOON",
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Chưa có sản phẩm nào trong giỏ hàng của bạn
          </p>
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
          <span className="text-gray-800 font-medium">Giỏ hàng</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Giỏ Hàng Của Bạn
        </h1>
        <p className="text-gray-600 mb-8">
          Quản lý các sản phẩm và đơn đặt trước
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sản phẩm thường */}
            {regularItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-6 w-6 text-pink-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Sản Phẩm Thường ({regularItems.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {regularItems.map((item, idx) => (
                    <div
                      key={item.id ?? item._id ?? `regular-${idx}`}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
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
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 rounded border border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition flex items-center justify-center"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 rounded border border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition flex items-center justify-center"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="font-bold text-gray-800">
                              {formatVND(
                                (item.sale_price || item.price) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sản phẩm đặt trước - Hết hàng */}
            {outOfStockItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Đặt Trước - Hết Hàng ({outOfStockItems.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {outOfStockItems.map((item, idx) => (
                    <div
                      key={item.id ?? item._id ?? `outofstock-${idx}`}
                      className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
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
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Payment Option */}
                          <div className="flex items-center gap-2 mb-3">
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

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Số lượng: <strong>{item.quantity}</strong>
                            </span>
                            <span className="font-bold text-gray-800">
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

            {/* Sản phẩm đặt trước - Sắp ra mắt */}
            {comingSoonItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Đặt Trước - Sắp Ra Mắt ({comingSoonItems.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {comingSoonItems.map((item, idx) => (
                    <div
                      key={item.id ?? item._id ?? `comingsoon-${idx}`}
                      className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
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
                              onClick={() => removeFromCart(item.id)}
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

                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Gift className="h-3 w-3" />
                              Đã đăng ký - Chưa thanh toán
                            </span>
                          </div>

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
                  <span className="font-semibold">{cartItems.length}</span>
                </div>

                {regularItems.length > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Sản phẩm thường</span>
                    <span className="font-semibold">{regularItems.length}</span>
                  </div>
                )}

                {outOfStockItems.length > 0 && (
                  <>
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
                  </>
                )}

                {comingSoonItems.length > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Sắp ra mắt (đã đăng ký)</span>
                    <span className="font-semibold">
                      {comingSoonItems.length}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng tạm tính</span>
                    <span className="text-lg font-bold text-gray-800">
                      {formatVND(getTotalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Cần thanh toán ngay
                    </span>
                    <span className="text-2xl font-bold text-pink-500">
                      {formatVND(getTotalPayNow())}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition mb-3"
              >
                Thanh toán
                <ArrowRight className="h-5 w-5" />
              </Link>

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
