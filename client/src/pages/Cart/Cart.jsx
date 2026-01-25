import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Gift,
} from "lucide-react";
import { useCart } from "../../context/CartContext"; // Import useCart

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalItems } =
    useCart(); // Lấy từ Context

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1500);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SALE10") {
      setAppliedPromo({ code: "SALE10", discount: 0.1, type: "percent" });
      alert("Áp dụng mã giảm giá 10% thành công!");
    } else if (promoCode.toUpperCase() === "FREESHIP") {
      setAppliedPromo({ code: "FREESHIP", discount: 0, type: "freeship" });
      alert("Áp dụng miễn phí vận chuyển thành công!");
    } else {
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  const toggleLoyaltyPoints = () => {
    setUseLoyaltyPoints(!useLoyaltyPoints);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.sale_price || item.price) * item.quantity,
    0,
  );

  // Tính giảm giá từ mã promo
  const promoDiscount =
    appliedPromo?.type === "percent" ? subtotal * appliedPromo.discount : 0;

  // Tính giảm giá từ điểm thành viên (1 điểm = 1000đ)
  const loyaltyDiscount = useLoyaltyPoints
    ? Math.min(loyaltyPoints * 1000, subtotal * 0.3)
    : 0;

  const subtotalAfterDiscount = subtotal - promoDiscount - loyaltyDiscount;

  // Phí vận chuyển
  const shipping =
    appliedPromo?.type === "freeship" || subtotalAfterDiscount > 500000
      ? 0
      : 30000;

  const total = subtotalAfterDiscount + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-pink-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-500 transition"
          >
            Tiếp tục mua sắm
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Giỏ hàng ({getTotalItems()} sản phẩm)
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex gap-4">
                  {/* Hình ảnh */}
                  <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-pink-500 mb-3">
                      {formatVND(item.sale_price || item.price)}
                    </p>

                    {/* Số lượng */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-50 transition rounded-l-lg"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none"
                          min="1"
                          max={item.stock}
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-50 transition rounded-r-lg"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Tổng giá */}
                      <span className="font-bold text-gray-800">
                        {formatVND(
                          (item.sale_price || item.price) * item.quantity,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Nút xóa */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Mã giảm giá */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-pink-500" />
                <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={applyPromoCode}
                  className="px-6 py-2 bg-pink-400 text-white rounded-lg font-semibold hover:bg-pink-500 transition"
                >
                  Áp dụng
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  ✓ Đã áp dụng mã: <strong>{appliedPromo.code}</strong>
                  <button
                    onClick={() => setAppliedPromo(null)}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Gợi ý: SALE10 (giảm 10%), FREESHIP (miễn phí ship)
              </p>
            </div>

            {/* Điểm thành viên */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-pink-500" />
                  <h3 className="font-semibold text-gray-800">
                    Sử dụng điểm thành viên
                  </h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLoyaltyPoints}
                    onChange={toggleLoyaltyPoints}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Bạn có{" "}
                <strong className="text-pink-600">{loyaltyPoints} điểm</strong>{" "}
                (≈ {formatVND(loyaltyPoints * 1000)})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tối đa giảm 30% giá trị đơn hàng. 1 điểm = 1.000đ
              </p>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{formatVND(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá (mã)</span>
                    <span className="font-semibold">
                      -{formatVND(promoDiscount)}
                    </span>
                  </div>
                )}

                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá (điểm)</span>
                    <span className="font-semibold">
                      -{formatVND(loyaltyDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span
                    className={`font-semibold ${
                      shipping === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shipping === 0 ? "Miễn phí" : formatVND(shipping)}
                  </span>
                </div>

                {shipping > 0 && subtotalAfterDiscount < 500000 && (
                  <p className="text-xs text-gray-500">
                    Mua thêm {formatVND(500000 - subtotalAfterDiscount)} để được
                    miễn phí vận chuyển
                  </p>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-pink-500">
                      {formatVND(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-pink-400 text-white py-3 rounded-lg font-semibold hover:bg-pink-500 transition mb-3"
              >
                Tiến hành thanh toán
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/products"
                className="w-full block text-center text-pink-600 font-medium py-3 border border-pink-400 rounded-lg hover:bg-pink-50 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
