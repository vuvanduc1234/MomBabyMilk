import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";

export function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
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

  return (
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
          {/* Discount badge - màu đỏ */}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {/* Hot badge - màu vàng cam */}
          {product.is_featured && (
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
              Hot
            </span>
          )}
        </div>

        {/* Overlay hết hàng */}
        {product.stock <= 0 && (
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
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3 min-h-[2.5rem] leading-tight">
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
            {/* Giá sale - màu hồng đậm */}
            <span className="text-xl font-bold text-pink-500">
              {formatVND(product.sale_price || product.price)}
            </span>
            {/* Giá gốc gạch ngang */}
            {product.sale_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatVND(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Nút thêm vào giỏ - màu hồng pastel */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            product.stock <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-pink-400 text-white hover:bg-pink-500 active:scale-95"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ
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
  );
}
