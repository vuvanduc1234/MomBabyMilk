// src/pages/BlogList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchBlogs();
  }, [sortBy]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "/api/blogs";
      if (sortBy === "popular") endpoint = "/api/blogs/popular";

      const response = await axiosInstance.get(endpoint);
      let fetchedPosts = response.data.data || response.data;

      if (sortBy === "oldest") {
        fetchedPosts = [...fetchedPosts].reverse();
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => setSortBy(e.target.value);

  const featuredPost = posts.find((post) => post.featured) || posts[0];
  const regularPosts = posts.filter((post) => post._id !== featuredPost?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có bài viết nào
          </h2>
          <p className="text-gray-600">
            Hãy quay lại sau để đọc những bài viết mới nhất!
          </p>
        </div>
      </div>
    );
  }

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
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition cursor-pointer border-none outline-none"
          >
            <option value="latest">MỚI NHẤT</option>
            <option value="popular">PHỔ BIẾN</option>
            <option value="oldest">CŨ NHẤT</option>
          </select>
        </div>

        {/* Featured Post + 2 Side Posts */}
        {featuredPost && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Featured Large Post */}
            <Link
              to={`/blog/${featuredPost._id}`}
              className="lg:col-span-2 group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-[500px] overflow-hidden bg-gray-200">
                {featuredPost.image || featuredPost.thumbnail ? (
                  <>
                    <img
                      src={featuredPost.image || featuredPost.thumbnail}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
                    {featuredPost.category || "BÀI VIẾT NỔI BẬT"}
                  </span>
                  <h2 className="text-3xl font-black mb-3 leading-tight group-hover:text-pink-300 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-200 text-base mb-3 line-clamp-2">
                    {featuredPost.excerpt || featuredPost.description || ""}
                  </p>
                  <div className="text-sm text-gray-300">
                    {featuredPost.date ||
                      new Date(featuredPost.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Two Side Posts */}
            <div className="flex flex-col gap-6">
              {regularPosts.slice(0, 2).map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post._id}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-[242px] overflow-hidden bg-gray-200">
                    {post.image || post.thumbnail ? (
                      <>
                        <img
                          src={post.image || post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-10 h-10 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">Không có ảnh</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="inline-block px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-wide">
                        {post.category || "BÀI VIẾT MỚI"}
                      </span>
                      <h3 className="text-lg font-black mb-2 leading-tight group-hover:text-pink-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="text-xs text-gray-300">
                        {post.date ||
                          new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </div>
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
              key={post._id}
              to={`/blog/${post._id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[320px] overflow-hidden bg-gray-200">
                {post.image || post.thumbnail ? (
                  <>
                    <img
                      src={post.image || post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="inline-block px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-wide">
                    {post.category || "BÀI VIẾT MỚI"}
                  </span>
                  <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-pink-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                    {post.excerpt || post.description || ""}
                  </p>
                  <div className="text-xs text-gray-300">
                    {post.date ||
                      new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Custom Styles — fixed: removed jsx prop */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600&display=swap");
        h1, h2, h3 { font-family: "Montserrat", sans-serif; }
        body { font-family: "Open Sans", sans-serif; }
      `}</style>
    </div>
  );
}
