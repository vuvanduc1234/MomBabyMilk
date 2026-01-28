// src/pages/Checkout/Checkout.jsx (Enhanced with Pre-order Support)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  Package,
  Calendar,
  Info,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { usePreOrder } from "../../context/PreOrderContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { preOrderItems, getTotalPreOrderPrice, clearPreOrders } =
    usePreOrder();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tính toán cho giỏ hàng thường
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.sale_price || item.price) * item.quantity,
    0,
  );

  // Tính toán cho pre-order (chỉ tính những đơn thanh toán ngay)
  const preOrderSubtotal = preOrderItems
    .filter((item) => item.paymentOption === "PAY_NOW")
    .reduce(
      (sum, item) => sum + (item.sale_price || item.price) * item.quantity,
      0,
    );

  // Tổng tạm tính
  const subtotal = cartSubtotal + preOrderSubtotal;

  // Phí vận chuyển
  const shipping = subtotal > 500000 ? 0 : 30000;

  // Tổng cộng
  const total = subtotal + shipping;

  // Lấy danh sách pre-order theo loại
  const outOfStockItems = preOrderItems.filter(
    (item) => item.preOrderType === "OUT_OF_STOCK",
  );
  const comingSoonItems = preOrderItems.filter(
    (item) => item.preOrderType === "COMING_SOON",
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Tạo message chi tiết
    let message = `Đặt hàng thành công!\n\n`;

    if (cartItems.length > 0) {
      message += `✓ Sản phẩm thường: ${cartItems.length} sản phẩm\n`;
    }

    if (
      outOfStockItems.filter((i) => i.paymentOption === "PAY_NOW").length > 0
    ) {
      message += `✓ Đặt trước (hết hàng): ${outOfStockItems.filter((i) => i.paymentOption === "PAY_NOW").length} sản phẩm\n`;
    }

    if (comingSoonItems.length > 0) {
      message += `✓ Đặt trước (sắp ra mắt): ${comingSoonItems.length} sản phẩm (đã đăng ký)\n`;
    }

    message += `\nPhương thức: ${
      paymentMethod === "cod"
        ? "COD"
        : paymentMethod === "vnpay"
          ? "VNPay"
          : paymentMethod === "momo"
            ? "Ví MoMo"
            : "Chuyển khoản"
    }\n`;

    message += `Tổng thanh toán: ${formatVND(total)}`;

    alert(message);

    // Xóa giỏ hàng và pre-orders đã thanh toán
    clearCart();
    // Chỉ xóa những pre-order đã thanh toán
    preOrderItems
      .filter((item) => item.paymentOption === "PAY_NOW")
      .forEach((item) => {
        // TODO: Implement removeFromPreOrder for specific items
      });

    navigate("/");
  };

  // Kiểm tra nếu không có gì để thanh toán
  if (
    cartItems.length === 0 &&
    preOrderItems.filter((i) => i.paymentOption === "PAY_NOW").length === 0
  ) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không có sản phẩm nào cần thanh toán
          </h2>
          <p className="text-gray-500 mb-6">
            Vui lòng thêm sản phẩm vào giỏ hàng hoặc đặt trước sản phẩm
          </p>
          <Link
            to="/products"
            className="inline-block bg-pink-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-500 transition"
          >
            Về trang sản phẩm
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
          <Link to="/cart" className="hover:text-pink-600 transition">
            Giỏ hàng
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Thanh toán</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán</h1>
        <p className="text-gray-600 mb-8">
          {cartItems.length > 0 && `${cartItems.length} sản phẩm thường`}
          {cartItems.length > 0 && preOrderItems.length > 0 && " • "}
          {preOrderItems.length > 0 &&
            `${preOrderItems.filter((i) => i.paymentOption === "PAY_NOW").length} sản phẩm đặt trước`}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form thông tin */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thông tin giao hàng */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Thông tin giao hàng
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0912345678"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  ></textarea>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú đơn hàng (tùy chọn)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Thông tin Pre-order (nếu có) */}
              {preOrderItems.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      Thông Tin Đặt Trước
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700">
                    {outOfStockItems.filter(
                      (i) => i.paymentOption === "PAY_NOW",
                    ).length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-orange-500" />
                          <strong className="text-orange-700">
                            Sản phẩm hết hàng:
                          </strong>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          • Bạn đã chọn thanh toán ngay để được ưu tiên giao
                          hàng đầu tiên
                          <br />
                          • Sản phẩm sẽ được giao ngay khi hàng về kho
                          <br />• Chúng tôi sẽ thông báo cho bạn qua số điện
                          thoại và email
                        </p>
                      </div>
                    )}

                    {outOfStockItems.filter(
                      (i) => i.paymentOption === "PAY_LATER",
                    ).length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-blue-500" />
                          <strong className="text-blue-700">
                            Giữ chỗ (thanh toán sau):
                          </strong>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          •{" "}
                          {
                            outOfStockItems.filter(
                              (i) => i.paymentOption === "PAY_LATER",
                            ).length
                          }{" "}
                          sản phẩm đang giữ chỗ
                          <br />
                          • Bạn có 48 giờ để thanh toán khi nhận được thông báo
                          hàng về
                          <br />• Không cần thanh toán trong đơn hàng này
                        </p>
                      </div>
                    )}

                    {comingSoonItems.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <strong className="text-purple-700">
                            Sản phẩm sắp ra mắt:
                          </strong>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          • {comingSoonItems.length} sản phẩm đã đăng ký nhận
                          thông báo
                          <br />
                          • Chưa cần thanh toán, chỉ đăng ký ưu tiên
                          <br />• Bạn sẽ nhận thông báo khi sản phẩm chính thức
                          mở bán
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-pink-500" />
                        <span className="font-semibold text-gray-800">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "vnpay"
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-pink-500" />
                        <span className="font-semibold text-gray-800">
                          VNPay
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán qua cổng VNPay
                      </p>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "momo"
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-pink-500" />
                        <span className="font-semibold text-gray-800">
                          Ví MoMo
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán qua ví điện tử MoMo
                      </p>
                    </div>
                  </label>

                  {/* Chuyển khoản */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "bank"
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-pink-500" />
                        <span className="font-semibold text-gray-800">
                          Chuyển khoản ngân hàng
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Chuyển khoản trực tiếp
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Đơn hàng của bạn */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Danh sách sản phẩm */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {/* Sản phẩm thường */}
                  {cartItems.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Sản phẩm thường
                      </div>
                      {cartItems.map((item) => (
                        <div key={`cart-${item.id}`} className="flex gap-3">
                          <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              x{item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-pink-500">
                              {formatVND(
                                (item.sale_price || item.price) * item.quantity,
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Sản phẩm đặt trước (thanh toán ngay) */}
                  {preOrderItems.filter((i) => i.paymentOption === "PAY_NOW")
                    .length > 0 && (
                    <>
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1 mt-4">
                        <Package className="h-3 w-3" />
                        Đặt trước (thanh toán ngay)
                      </div>
                      {preOrderItems
                        .filter((i) => i.paymentOption === "PAY_NOW")
                        .map((item) => (
                          <div
                            key={`preorder-${item.id}`}
                            className="flex gap-3 bg-orange-50 p-2 rounded-lg"
                          >
                            <img
                              src={item.image_url || item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                x{item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-orange-600">
                                {formatVND(
                                  (item.sale_price || item.price) *
                                    item.quantity,
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>

                {/* Tổng tiền */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">{formatVND(subtotal)}</span>
                  </div>
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
                  <div className="border-t border-gray-200 pt-3">
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

                {/* Nút đặt hàng */}
                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Đặt hàng ngay
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link to="#" className="text-pink-600 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
