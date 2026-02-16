// src/pages/BlogPost.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // Fetch blog post by ID
  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/api/blogs/${id}`);

      const fetchedPost = response.data.data || response.data;
      setPost(fetchedPost);

      // Fetch related posts if tags are available
      if (fetchedPost.tags && fetchedPost.tags.length > 0) {
        fetchRelatedPosts(fetchedPost.tags[0]);
      }
    } catch (err) {
      console.error("Error fetching blog post:", err);
      if (err.response?.status === 404) {
        setError("Bài viết không tồn tại");
      } else {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (tag) => {
    try {
      const response = await axiosInstance.get(`/api/blogs/tags/${tag}`);
      const posts = response.data.data || response.data;

      // Filter out current post and limit to 3 related posts
      const filtered = posts.filter((p) => p._id !== id).slice(0, 3);
      setRelatedPosts(filtered);
    } catch (err) {
      console.error("Error fetching related posts:", err);
      // Don't show error for related posts, just log it
    }
  };

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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-6 text-gray-900">
            {error || "Bài viết không tồn tại"}
          </h1>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            ← Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-400 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <Link to="/" className="hover:underline">
              Trang chủ
            </Link>
            <span>›</span>
            <Link to="/blog" className="hover:underline">
              Blog
            </Link>
            <span>›</span>
            <span className="line-clamp-1">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Quay lại danh sách bài viết
        </Link>
      </div>

      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
            {/* Featured Image */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              <img
                src={
                  post.image ||
                  post.thumbnail ||
                  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&auto=format&fit=crop"
                }
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Article Meta & Content */}
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  {post.category || "BÀI VIẾT"}
                </span>
                <span className="text-gray-500 text-sm">
                  {post.date ||
                    new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
                {post.readTime && (
                  <span className="text-gray-500 text-sm">
                    • {post.readTime}
                  </span>
                )}
                {post.author && (
                  <span className="text-gray-500 text-sm">• {post.author}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-3 pb-8 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-semibold">
                  Chia sẻ:
                </span>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                      "_blank",
                    )
                  }
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  aria-label="Share on Facebook"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    window.open(`https://www.instagram.com/`, "_blank")
                  }
                  className="p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                  aria-label="Share on Instagram"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + window.location.href)}`,
                      "_blank",
                    )
                  }
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  aria-label="Share on WhatsApp"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </button>
              </div>

              {/* Article Content */}
              <div
                className="article-content mt-8"
                dangerouslySetInnerHTML={{
                  __html: post.content || post.body || "",
                }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 font-semibold">
                      Tags:
                    </span>
                    {post.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/blog/tags/${tag}`}
                        className="px-4 py-2 bg-pink-100 text-pink-700 text-sm font-semibold rounded-full hover:bg-pink-200 transition cursor-pointer"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                Bài Viết Liên Quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id}
                    to={`/blog/${relatedPost._id}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          relatedPost.image ||
                          relatedPost.thumbnail ||
                          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop"
                        }
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt || relatedPost.description || ""}
                      </p>
                      <div className="mt-4 text-xs text-gray-500">
                        {relatedPost.date ||
                          new Date(relatedPost.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Custom Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600;700&display=swap");

        h1,
        h2,
        h3 {
          font-family: "Montserrat", sans-serif;
        }

        .article-content {
          font-family: "Open Sans", sans-serif;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #374151;
        }

        .article-content .lead-text {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #4b5563;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 900;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #ec4899;
        }

        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .article-content p {
          margin-bottom: 1.5rem;
        }

        .article-content .custom-list {
          list-style: none;
          padding-left: 0;
          margin-bottom: 2rem;
        }

        .article-content .custom-list li {
          padding-left: 2rem;
          position: relative;
          margin-bottom: 1rem;
          line-height: 1.8;
        }

        .article-content .custom-list li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: #ec4899;
          font-weight: bold;
          font-size: 1.25rem;
        }

        .article-content .highlight-box {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          border-left: 4px solid #ec4899;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        .article-content .highlight-box p {
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #831843;
        }

        .article-content .highlight-box p:last-child {
          margin-bottom: 0;
        }

        .article-content strong {
          color: #ec4899;
          font-weight: 700;
        }

        .article-content em {
          color: #6b7280;
          font-style: italic;
        }

        .article-content ul:not(.custom-list) {
          list-style: disc;
          padding-left: 2rem;
          margin-bottom: 1.5rem;
        }

        .article-content ol {
          list-style: decimal;
          padding-left: 2rem;
          margin-bottom: 1.5rem;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        .article-content blockquote {
          border-left: 4px solid #ec4899;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
