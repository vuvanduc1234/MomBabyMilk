// src/components/Layout/Header.jsx
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Phone,
  Gift,
  Truck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { getTotalItems } = useCart();

  return (
    <header
      className="bg-white/95 shadow-sm sticky top-0 border-b border-gray-100/50"
      style={{ zIndex: 10000 }}
    >
      {/* Thanh thông báo chạy chữ */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="inline-flex items-center gap-2 mx-8">
            <Phone className="h-4 w-4" />
            Hotline: 1900 xxxx (8:00 - 22:00)
          </span>
          <span className="inline-flex items-center gap-2 mx-8">
            <Gift className="h-4 w-4" />
            Miễn phí giao hàng đơn từ 500.000đ
          </span>
          <span className="inline-flex items-center gap-2 mx-8">
            <Truck className="h-4 w-4" />
            Giao hàng nhanh toàn quốc
          </span>
          {/* Duplicate để tạo hiệu ứng loop liền mạch */}
          <span className="inline-flex items-center gap-2 mx-8">
            <Phone className="h-4 w-4" />
            Hotline: 1900 xxxx (8:00 - 22:00)
          </span>
          <span className="inline-flex items-center gap-2 mx-8">
            <Gift className="h-4 w-4" />
            Miễn phí giao hàng đơn từ 500.000đ
          </span>
          <span className="inline-flex items-center gap-2 mx-8">
            <Truck className="h-4 w-4" />
            Giao hàng nhanh toàn quốc
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-300 to-blue-400 shadow-md">
                <img
                  src="/1.png"
                  alt="MomBabyMilk Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                MomBabyMilk
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                to="#"
                className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition"
              >
                <Heart className="h-6 w-6" />
                <span className="text-xs mt-1">Yêu thích</span>
              </Link>
              <Link
                to="#"
                className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition"
              >
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Tài khoản</span>
              </Link>
              <Link
                to="/cart"
                className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition relative"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs mt-1">Giỏ hàng</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-gray-100/50">
          <div className="flex items-center justify-center gap-8 py-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Sản phẩm
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Khuyến mãi
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Thương hiệu
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Hỗ trợ
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              Theo dõi đơn hàng
            </Link>
          </div>
        </nav>
      </div>

      {/* CSS Animation cho chữ chạy */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
}
