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
      className="bg-white/95 shadow-sm sticky top-0 backdrop-filter backdrop-blur-md"
      style={{ zIndex: 10000 }}
    >
      {/* Thanh thông báo chạy chữ */}
      <div className="bg-pink-600 text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-sm tracking-tight font-medium">
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
            <div className="flex flex-row gap-6 items-center">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/nura-logo-accent.svg"
                  alt="MomBabyMilk Logo"
                  className="max-h-14"
                />
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <p className="leading-5 text-sm">
                  Cửa hàng sữa cho
                  <br /> mẹ và bé
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <Link
                to="#"
                className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition"
              >
                <Heart className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-xs">Yêu thích</span>
              </Link>
              <Link
                to="/login"
                className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition"
              >
                <User className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-xs">Tài khoản</span>
              </Link>
              <div className="relative group">
                <Link
                  to="/cart"
                  className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition relative"
                >
                  <ShoppingCart className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs">Giỏ hàng</span>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50 transition-all duration-300 ease-in-out">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-w-75 relative">
                    {/* Arrow */}
                    <div className="absolute -top-1.5 right-5 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                    {getTotalItems() === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-2">
                        Giỏ hàng chưa có sản phẩm.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-gray-600 text-sm text-center">
                          Có{" "}
                          <span className="font-bold text-pink-500">
                            {getTotalItems()}
                          </span>{" "}
                          sản phẩm trong giỏ hàng
                        </p>
                        <Link
                          to="/cart"
                          className="w-full bg-pink-600 text-white text-sm py-2 rounded hover:bg-pink-700 transition text-center"
                        >
                          Xem giỏ hàng
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Link
              to="/products"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Sản phẩm</div>
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Khuyến mãi</div>
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Theo dõi đơn hàng</div>
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Hỗ trợ</div>
            </Link>
            {/* Thêm link Blog */}
            <Link
              to="/blog"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Blog</div>
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
