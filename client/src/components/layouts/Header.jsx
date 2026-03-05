// src/components/Layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Phone,
  Gift,
  Truck,
  LogOut,
  UserCircle,
  Settings,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../NotificationDropdown";

export default function Header() {
  const { getTotalUniqueItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white transition-all"
                />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              {/* Account Dropdown */}
              <div className="relative group">
                <div className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition cursor-pointer">
                  <User className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs">
                    {isAuthenticated()
                      ? user?.fullname || "Tài khoản"
                      : "Tài khoản"}
                  </span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50 transition-all duration-300 ease-in-out">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 min-w-[220px] overflow-hidden">
                    {/* Arrow */}
                    <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                    {isAuthenticated() ? (
                      // Logged in menu
                      <div className="relative">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.fullname || user?.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/account"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          >
                            <UserCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Hồ sơ của tôi
                            </span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Đăng xuất
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Not logged in menu
                      <div className="py-2">
                        <Link
                          to="/login"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium transition-colors"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium transition-colors"
                        >
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              {isAuthenticated() && <NotificationDropdown />}

              {/* Cart */}
              <div className="relative group">
                <Link
                  to="/cart"
                  className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition relative"
                >
                  <ShoppingCart className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs">Giỏ hàng</span>
                  {getTotalUniqueItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {getTotalUniqueItems()}
                    </span>
                  )}
                </Link>
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
              to="/track-order"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Theo dõi đơn hàng</div>
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Blog</div>
            </Link>
            <Link
              to="/support"
              className="text-gray-700 hover:text-pink-600 font-medium transition"
            >
              <div className="p-3">Hỗ trợ</div>
            </Link>
          </div>
        </nav>
      </div>

      {/* CSS Animation */}
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
