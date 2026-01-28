// src/pages/BlogList.jsx
import { Link } from "react-router-dom";

// Dữ liệu mẫu (sau này bạn có thể fetch từ API hoặc dùng CMS)
const posts = [
  {
    id: 1,
    title: "Review 30 ngày dùng sữa Aptamil Cesarbiotik cho bé sinh mổ",
    excerpt:
      "Trẻ sinh mổ tăng cường để kháng vững vàng, mẹ yên lòng khi động sáng. Chia sẻ kinh nghiệm thực tế sau 30 ngày sử dụng...",
    date: "25/06/2025",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop",
    category: "BÀI VIẾT MỚI",
    featured: true,
  },
  {
    id: 2,
    title:
      "Sữa Aptamil Cesarbiotik – Dinh dưỡng khoa học hỗ trợ đề kháng và trí não cho trẻ sinh mổ",
    excerpt:
      "Giải pháp dinh dưỡng chuyên biệt với công thức Synbiotic độc quyền giúp bé sinh mổ phát triển toàn diện...",
    date: "20/06/2025",
    image:
      "https://images.unsplash.com/photo-1578496781379-7dcfb995293d?w=800&auto=format&fit=crop",
    category: "BÀI VIẾT MỚI",
  },
  {
    id: 3,
    title: "Sữa Aptamil cho trẻ sinh mổ có gì đặc biệt?",
    excerpt:
      "Khám phá những ưu điểm vượt trội của dòng sữa Aptamil dành riêng cho bé sinh mổ với công nghệ tiên tiến...",
    date: "18/06/2025",
    image:
      "https://images.unsplash.com/photo-1609220136736-443848f681c4?w=800&auto=format&fit=crop",
    category: "BÀI VIẾT MỚI",
  },
  {
    id: 4,
    title: "Tất tần tật thông tin bình sữa Moyuum Movaa thế hệ mới",
    excerpt:
      "Review chi tiết về dòng bình sữa Moyuum Movaa với thiết kế hiện đại và tính năng ưu việt cho bé...",
    date: "15/06/2025",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop",
    category: "BÀI VIẾT MỚI",
  },
  {
    id: 5,
    title: "Lịch hội thảo tiền sản miễn phí tháng 3/2025 tại Hà Nội",
    excerpt:
      "Thông tin đầy đủ về các buổi hội thảo dành cho mẹ bầu và mẹ sau sinh trong tháng 3/2025...",
    date: "12/06/2025",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop",
    category: "BÀI VIẾT MỚI",
  },
  {
    id: 6,
    title: "Chương trình khuyến mãi tháng 1 - Bím sữa tặng xe Vinfast",
    excerpt:
      "Cơ hội trúng xe Vinfast cùng hàng ngàn phần quà hấp dẫn khi mua sữa trong tháng 1/2025...",
    date: "10/06/2025",
    image:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop",
    category: "Bài viết mới",
  },
];

export default function BlogList() {
  const featuredPost = posts.find((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-400 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <Link to="/" className="hover:underline">
                Trang chủ
              </Link>
              <span>›</span>
              <span>Bài viết mới</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Bài Viết Mới
          </h1>
          <select className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition cursor-pointer border-none outline-none">
            <option>MỚI NHẤT</option>
            <option>PHỔ BIẾN</option>
            <option>CŨ NHẤT</option>
          </select>
        </div>

        {/* Featured Post + 2 Side Posts */}
        {featuredPost && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Featured Large Post */}
            <Link
              to={`/blog/${featuredPost.id}`}
              className="lg:col-span-2 group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-[500px] overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-3xl font-black mb-3 leading-tight group-hover:text-pink-300 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-200 text-base mb-3 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                  <div className="text-sm text-gray-300">
                    {featuredPost.date}
                  </div>
                </div>
              </div>
            </Link>

            {/* Two Side Posts */}
            <div className="flex flex-col gap-6">
              {regularPosts.slice(0, 2).map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-[242px] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="inline-block px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-wide">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-black mb-2 leading-tight group-hover:text-pink-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="text-xs text-gray-300">{post.date}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid of Remaining Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.slice(2).map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[320px] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="inline-block px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-pink-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="text-xs text-gray-300">{post.date}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600&display=swap");

        h1,
        h2,
        h3 {
          font-family: "Montserrat", sans-serif;
        }

        body {
          font-family: "Open Sans", sans-serif;
        }
      `}</style>
    </div>
  );
}
