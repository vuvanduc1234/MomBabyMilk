// src/components/PreOrder/PreOrderModal.jsx
import { useState } from "react";
import {
  X,
  Calendar,
  CreditCard,
  Package,
  CheckCircle,
  Info,
} from "lucide-react";

export function PreOrderModal({ product, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const selectedOption = "PAY_NOW"; // Chỉ hỗ trợ thanh toán ngay

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isOutOfStock = product.quantity === 0 && !product.expectedRestockDate;

  const handleConfirm = () => {
    if (!selectedOption && isOutOfStock) return;

    const preOrderType = isOutOfStock ? "OUT_OF_STOCK" : "COMING_SOON";
    onConfirm({
      product,
      quantity,
      preOrderType,
      paymentOption: selectedOption,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isOutOfStock ? (
                  <Package className="h-6 w-6" />
                ) : (
                  <Calendar className="h-6 w-6" />
                )}
                <h2 className="text-2xl font-bold">
                  {isOutOfStock
                    ? "Đặt Trước - Hết Hàng"
                    : "Đặt Trước - Sắp Ra Mắt"}
                </h2>
              </div>
              <p className="text-pink-100 text-sm">
                {isOutOfStock
                  ? "Sản phẩm tạm hết hàng. Đặt trước để giữ chỗ khi hàng về!"
                  : "Sản phẩm chưa phát hành. Đăng ký đặt trước ngay hôm nay!"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <img
              src={product.image_url || product.image}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-pink-600">
                {formatVND(product.sale_price || product.price)}
              </p>
              {product.expectedRestockDate && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Ngày phát hành:{" "}
                    <strong>
                      {new Date(product.expectedRestockDate).toLocaleDateString(
                        "vi-VN",
                      )}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng đặt trước
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition font-bold text-gray-700"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center text-lg font-bold border-2 border-gray-300 rounded-lg py-2 focus:outline-none focus:border-pink-400"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition font-bold text-gray-700"
              >
                +
              </button>
              <div className="ml-auto text-right">
                <p className="text-sm text-gray-600">Tổng cộng</p>
                <p className="text-xl font-bold text-pink-600">
                  {formatVND((product.sale_price || product.price) * quantity)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {isOutOfStock ? "Hình thức thanh toán" : "Thông tin quan trọng"}
          </h3>

          {isOutOfStock ? (
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-5">
              <div className="flex gap-3 mb-3">
                <CreditCard className="h-6 w-6 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Thanh toán ngay
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Thanh toán ngay để đảm bảo đơn hàng của bạn. Sản phẩm sẽ
                    được giao ngay khi hàng về kho.
                  </p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  Ưu tiên giao hàng đầu tiên khi hàng về kho
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex gap-3 mb-4">
                <Info className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="leading-relaxed">
                    <strong className="text-purple-700">
                      Sản phẩm chưa phát hành:
                    </strong>{" "}
                    Hiện tại sản phẩm này chưa được lưu hành chính thức. Bạn chỉ
                    có thể đăng ký đặt trước để được ưu tiên khi sản phẩm ra
                    mắt.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-purple-700">
                      Không thanh toán trước:
                    </strong>{" "}
                    Bạn chưa cần thanh toán. Chúng tôi sẽ thông báo khi sản phẩm
                    chính thức mở bán và bạn có thể quyết định mua hay không.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-purple-700">
                      Không giao hàng trước:
                    </strong>{" "}
                    Sản phẩm chỉ được giao sau ngày phát hành chính thức.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">
                  💡 Đăng ký ngay để không bỏ lỡ cơ hội sở hữu sản phẩm khi ra
                  mắt!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]"
            >
              {isOutOfStock ? "Xác Nhận Đặt Trước" : "Đăng Ký Ngay"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
