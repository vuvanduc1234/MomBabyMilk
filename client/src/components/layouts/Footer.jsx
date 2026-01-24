// src/components/Layout/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Slogan */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">MomBabyMilk</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Cung cấp sản phẩm dinh dưỡng chất lượng cao
              <br />
              Đồng hành cùng mẹ và bé khỏe mạnh, vui vẻ mỗi ngày
            </p>
          </div>

          {/* Chính sách */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">
              Chính sách
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/chinh-sach-doi-tra"
                  className="hover:text-white transition"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  to="/chinh-sach-bao-mat"
                  className="hover:text-white transition"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/chinh-sach-van-chuyen"
                  className="hover:text-white transition"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/dieu-khoan-dich-vu"
                  className="hover:text-white transition"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/huong-dan-thanh-toan"
                  className="hover:text-white transition"
                >
                  Hướng dẫn thanh toán
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-center gap-2">
                <span>📞</span> Hotline: 1900 8888
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span> Email: info@mombabymilk.vn
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </li>
            </ul>

            <div className="mb-6">
              <p className="text-sm mb-2 font-medium">Thời gian làm việc:</p>
              <p className="text-sm">T2–T7: 8:00 – 22:00</p>
              <p className="text-sm">CN: 9:00 – 20:00</p>
            </div>
          </div>

          {/* Newsletter + Phương thức thanh toán */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">
              Nhận tin khuyến mãi
            </h4>
            <p className="text-sm mb-4">
              Đăng ký để nhận thông tin ưu đãi đặc biệt và quà tặng hấp dẫn dành
              cho mẹ & bé
            </p>
            <form className="flex flex-col sm:flex-row gap-2 mb-8">
              <input
                type="email"
                placeholder="Email của bạn"
                className="px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-pink-500 flex-1"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition text-sm whitespace-nowrap"
              >
                Gửi
              </button>
            </form>

            {/* Phương thức thanh toán - Tất cả logo */}
            <div>
              <p className="text-sm mb-3 font-medium">Phương thức thanh toán</p>
              <div className="flex flex-wrap items-center gap-6">
                {/* VISA */}
                <img
                  src="https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png"
                  alt="VISA"
                  className="h-8 object-contain hover:opacity-80 transition"
                  loading="lazy"
                />
                {/* MasterCard - SVG transparent official-style */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-8 object-contain hover:opacity-80 transition"
                  loading="lazy"
                />
                {/* MoMo - dùng local sau khi tải ZIP (hoặc fallback text nếu chưa tải) */}
                <img
                  src="https://homepage.momocdn.net/fileuploads/svg/momo-file-240411162904.svg" // Extract từ https://static.momocdn.net/app/zip/developer-v3/MoMo_Logo_Colored_Primary.zip
                  alt="MoMo"
                  className="h-8 object-contain hover:opacity-80 transition"
                  loading="lazy"
                />
                {/* ZaloPay - transparent SVG/PNG từ Seeklogo */}
                <img
                  src="https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg"
                  alt="ZaloPay"
                  className="h-8 object-contain hover:opacity-80 transition"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 bg-gray-950 py-6">
        <div className="container mx-auto px-6 text-center md:text-left text-sm text-gray-500">
          <p>
            © 2026 MomBabyMilk. All rights reserved. Made with ❤️ for healthy
            moms & happy babies
          </p>
        </div>
      </div>
    </footer>
  );
}
