// src/components/Products/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Calendar, Clock, Package } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { PreOrderModal } from "../PreOrder/PreOrderModal";

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Kiểm tra xem có phải sản phẩm đặt trước không
    const isPreOrderProduct =
      product.stock === 0 ||
      (product.releaseDate && new Date(product.releaseDate) > new Date());

    if (isPreOrderProduct) {
      setShowPreOrderModal(true);
    } else {
      // Sản phẩm thường - thêm vào giỏ hàng bình thường
      addToCart(product);
    }
  };

  const handlePreOrderConfirm = ({
    product,
    quantity,
    preOrderType,
    paymentOption,
  }) => {
    // Thêm vào giỏ hàng với thông tin pre-order VÀ quantity
    addToCart(product, {
      quantity,
      preOrderType,
      paymentOption,
      releaseDate: product.releaseDate,
    });

    const message =
      preOrderType === "OUT_OF_STOCK"
        ? "Đã thêm vào giỏ hàng (Đặt trước)!"
        : "Đã đăng ký đặt trước thành công!";

    alert(message);
  };

  const discountPercent = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isOutOfStock = product.stock === 0 && !product.releaseDate;
  const isComingSoon =
    product.releaseDate && new Date(product.releaseDate) > new Date();
  const isPreOrderProduct = isOutOfStock || isComingSoon;

  return (
    <>
      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300">
        {/* Hình ảnh sản phẩm */}
        <div
          className="relative aspect-square overflow-hidden bg-white cursor-pointer"
          onClick={() => (window.location.href = `/product/${product.slug}`)}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Không có ảnh
            </div>
          )}

          {/* Badges góc trên bên trái */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Pre-order Badges */}
            {isOutOfStock && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1">
                <Package className="h-3 w-3" />
                ĐẶT TRƯỚC
              </span>
            )}
            {isComingSoon && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                SẮP RA MẮT
              </span>
            )}

            {/* Discount badge */}
            {discountPercent > 0 && !isPreOrderProduct && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}

            {/* Hot badge */}
            {product.is_featured && !isPreOrderProduct && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                Hot
              </span>
            )}
          </div>

          {/* Release Date Badge - góc trên bên phải */}
          {product.releaseDate && isComingSoon && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-purple-600">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">
                  {new Date(product.releaseDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          )}

          {/* Overlay hết hàng - chỉ hiện khi không phải pre-order */}
          {product.stock <= 0 && !isPreOrderProduct && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Nội dung thông tin */}
        <div className="p-4 pb-5">
          {/* Thương hiệu */}
          {product.brand && (
            <p className="text-xs text-gray-500 mb-1.5">{product.brand.name}</p>
          )}

          {/* Tên sản phẩm */}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3 min-h-10 leading-tight">
            {product.name}
          </h3>

          {/* Đánh giá sao */}
          <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              ({product.reviews || 0})
            </span>
          </div>

          {/* Giá */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-pink-500">
                {formatVND(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatVND(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Nút thêm vào giỏ / Đặt trước */}
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isOutOfStock
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 active:scale-95"
                : isComingSoon
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95"
                  : "bg-pink-400 text-white hover:bg-pink-500 active:scale-95"
            }`}
          >
            {isOutOfStock ? (
              <>
                <Package className="h-4 w-4" />
                Đặt Trước Ngay
              </>
            ) : isComingSoon ? (
              <>
                <Calendar className="h-4 w-4" />
                Đăng Ký Đặt Trước
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Thêm vào giỏ
              </>
            )}
          </button>

          {/* Nút xem chi tiết */}
          <Link
            to={`/product/${product.slug}`}
            className="w-full block mt-3 text-center py-2.5 border-2 border-pink-400 text-pink-600 rounded-xl text-sm font-semibold hover:bg-pink-50 transition-all duration-200"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* Pre-order Modal */}
      {showPreOrderModal && (
        <PreOrderModal
          product={product}
          onClose={() => setShowPreOrderModal(false)}
          onConfirm={handlePreOrderConfirm}
        />
      )}
    </>
  );
}
