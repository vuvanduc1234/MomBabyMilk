// src/pages/Checkout/Checkout.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  CreditCard,
  Smartphone,
  Package,
  Tag,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    getRegularItems,
    getPreOrdersByType,
    getTotalPayNow,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [myVouchers, setMyVouchers] = useState([]);
  const [myVouchersLoading, setMyVouchersLoading] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || user.fullname || user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchMyVouchers = async () => {
      if (!user) return;
      try {
        setMyVouchersLoading(true);
        const res = await axiosInstance.get("/api/users/my-vouchers");
        // API trả về { vouchers: [...] }, mỗi item: { voucherId: {...}, quantity }
        const raw = res.data?.vouchers || res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : [];
        const flattened = list.map((item) =>
          item.voucherId && typeof item.voucherId === "object"
            ? { ...item.voucherId, quantity: item.quantity ?? 1 }
            : item,
        );
        setMyVouchers(flattened);
      } catch (err) {
        console.error("Không thể tải danh sách voucher:", err);
      } finally {
        setMyVouchersLoading(false);
      }
    };
    fetchMyVouchers();
  }, [user]);

  const formatVND = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const regularItems = getRegularItems();
  const outOfStockItems = getPreOrdersByType("OUT_OF_STOCK").filter(
    (item) => item.paymentOption === "PAY_NOW",
  );

  const subtotal = getTotalPayNow();
  const shipping = subtotal > 500000 ? 0 : 30000;
  const discountAmount = appliedVoucher
    ? Math.round((subtotal * appliedVoucher.discountPercentage) / 100)
    : 0;
  const total = subtotal + shipping - discountAmount;

  // ── Validate & apply voucher ──────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher");
      return;
    }
    try {
      setVoucherLoading(true);
      setVoucherError("");
      const res = await axiosInstance.post("/api/voucher/validate", {
        code: voucherCode.trim().toUpperCase(),
        orderTotal: subtotal,
      });
      const voucher = res.data?.data || res.data;
      setAppliedVoucher(voucher);
      toast.success(
        `Áp dụng voucher "${voucher.code}" thành công! Giảm ${voucher.discountPercentage}%`,
      );
    } catch (err) {
      setVoucherError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Mã voucher không hợp lệ",
      );
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handleSelectMyVoucher = async (voucher) => {
    setShowVoucherList(false);
    setVoucherCode(voucher.code);
    setVoucherError("");
    try {
      setVoucherLoading(true);
      const res = await axiosInstance.post("/api/voucher/validate", {
        code: voucher.code,
        orderTotal: subtotal,
      });
      const validated = res.data?.data || res.data;
      setAppliedVoucher(validated);
      toast.success(
        `Áp dụng voucher "${validated.code}" thành công! Giảm ${validated.discountPercentage}%`,
      );
    } catch (err) {
      setVoucherError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Mã voucher không hợp lệ",
      );
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, "")))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.address.trim())
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Deduplicate cart items by productId, summing quantity if same product appears twice
      let skippedCount = 0;
      const deduped = Object.values(
        cartItems.reduce((acc, item) => {
          const pid = item.id || item._id;
          if (!pid) {
            skippedCount++;
            return acc;
          }
          if (acc[pid]) {
            acc[pid] = {
              ...acc[pid],
              quantity: acc[pid].quantity + item.quantity,
            };
          } else {
            acc[pid] = { productId: pid, quantity: item.quantity };
          }
          return acc;
        }, {}),
      );

      // Warn user if items were skipped
      if (skippedCount > 0) {
        toast.warning(
          `${skippedCount} sản phẩm không hợp lệ đã bị bỏ qua. Vui lòng kiểm tra lại giỏ hàng.`,
        );
      }

      if (deduped.length === 0) {
        toast.error("Giỏ hàng không có sản phẩm hợp lệ");
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        cartItems: deduped,
        shippingAddress: formData.address,
        phone: formData.phone,
        note: formData.note || "",
        paymentMethod: paymentMethod,
        ...(appliedVoucher && {
          voucherUsed:
            appliedVoucher.voucherId || appliedVoucher._id || appliedVoucher.id,
        }),
      };
      const response = await createOrder(orderData);
      if (response.payUrl) {
        window.location.href = response.payUrl;
        return;
      }
      toast.success("Đặt hàng thành công!");
      clearCart();
      setTimeout(() => navigate("/track-order"), 1500);
    } catch (error) {
      toast.error(
        error.message ||
          error.error ||
          "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (regularItems.length === 0 && outOfStockItems.length === 0) {
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

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán</h1>
        <p className="text-gray-600 mb-8">
          {regularItems.length > 0 && `${regularItems.length} sản phẩm thường`}
          {regularItems.length > 0 && outOfStockItems.length > 0 && " • "}
          {outOfStockItems.length > 0 &&
            `${outOfStockItems.length} sản phẩm đặt trước`}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                      placeholder="0912345678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng..."
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "cod",
                      icon: <Truck className="h-5 w-5 text-pink-500" />,
                      label: "Thanh toán khi nhận hàng (COD)",
                      desc: "Thanh toán bằng tiền mặt khi nhận hàng",
                    },
                    {
                      value: "vnpay",
                      icon: <CreditCard className="h-5 w-5 text-pink-500" />,
                      label: "VNPay",
                      desc: "Thanh toán qua cổng VNPay",
                    },
                    {
                      value: "momo",
                      icon: <Smartphone className="h-5 w-5 text-pink-500" />,
                      label: "Ví MoMo",
                      desc: "Thanh toán qua ví điện tử MoMo",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === method.value ? "border-pink-400 bg-pink-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          {method.icon}
                          <span className="font-semibold text-gray-800">
                            {method.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {method.desc}
                        </p>
                      </div>
                    </label>
                  ))}
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
                  {regularItems.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Sản phẩm thường
                      </div>
                      {regularItems.map((item) => (
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
                          <p className="text-sm font-bold text-pink-500">
                            {formatVND(
                              (item.sale_price || item.price) * item.quantity,
                            )}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                  {outOfStockItems.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1 mt-4">
                        <Package className="h-3 w-3" />
                        Đặt trước (thanh toán ngay)
                      </div>
                      {outOfStockItems.map((item) => (
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
                          <p className="text-sm font-bold text-orange-600">
                            {formatVND(
                              (item.sale_price || item.price) * item.quantity,
                            )}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* ── Voucher Input ─────────────────────────────────────── */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="h-4 w-4 text-pink-500" />
                    Mã giảm giá
                  </p>

                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-green-700 text-sm">
                            {appliedVoucher.code}
                          </span>
                          <p className="text-xs text-green-600">
                            Giảm {appliedVoucher.discountPercentage}% → -
                            {formatVND(discountAmount)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-gray-400 hover:text-red-500 transition ml-2"
                        title="Bỏ voucher"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value.toUpperCase());
                            setVoucherError("");
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleApplyVoucher())
                          }
                          placeholder="Nhập mã voucher"
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-400 ${voucherError ? "border-red-400" : "border-gray-300"}`}
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={voucherLoading || !voucherCode.trim()}
                          className="px-4 py-2 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {voucherLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Áp dụng"
                          )}
                        </button>
                      </div>
                      {voucherError && (
                        <p className="text-red-500 text-xs mt-1">
                          {voucherError}
                        </p>
                      )}

                      {/* Voucher của tôi */}
                      {user && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setShowVoucherList((v) => !v)}
                            className="text-xs text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 transition"
                          >
                            {myVouchersLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Tag className="h-3 w-3" />
                            )}
                            {showVoucherList
                              ? "Ẩn voucher của tôi"
                              : `Voucher của tôi${myVouchers.length > 0 ? ` (${myVouchers.length})` : ""}`}
                          </button>

                          {showVoucherList && (
                            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                              {myVouchersLoading ? (
                                <div className="flex items-center justify-center py-4 text-gray-400">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-xs">Đang tải...</span>
                                </div>
                              ) : myVouchers.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">
                                  Bạn chưa có voucher nào
                                </p>
                              ) : (
                                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                                  {myVouchers.map((v) => {
                                    const isUsedUp =
                                      v.quantity !== undefined &&
                                      v.quantity <= 0;
                                    return (
                                      <button
                                        key={v.code || v.id}
                                        type="button"
                                        disabled={isUsedUp}
                                        onClick={() => handleSelectMyVoucher(v)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition ${
                                          isUsedUp
                                            ? "opacity-40 cursor-not-allowed bg-gray-50"
                                            : "hover:bg-pink-50 cursor-pointer"
                                        }`}
                                      >
                                        <div>
                                          <span className="font-mono font-bold text-pink-600 text-sm">
                                            {v.code}
                                          </span>
                                          <p className="text-xs text-gray-500">
                                            Giảm {v.discountPercentage}%
                                            {v.minOrderValue
                                              ? ` • Đơn tối thiểu ${formatVND(v.minOrderValue)}`
                                              : ""}
                                            {v.quantity !== undefined
                                              ? ` • Còn ${v.quantity} lượt`
                                              : ""}
                                          </p>
                                        </div>
                                        {!isUsedUp && (
                                          <span className="text-xs text-pink-500 font-semibold shrink-0 ml-2">
                                            Dùng
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                      className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}
                    >
                      {shipping === 0 ? "Miễn phí" : formatVND(shipping)}
                    </span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Giảm giá ({appliedVoucher.discountPercentage}%)
                      </span>
                      <span className="font-semibold">
                        -{formatVND(discountAmount)}
                      </span>
                    </div>
                  )}
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
                  disabled={isSubmitting}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg"}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Đặt hàng ngay"
                  )}
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
