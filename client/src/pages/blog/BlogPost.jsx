// src/pages/BlogPost.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useCart } from "@/context/CartContext";

export default function BlogPost() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});

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

      // Dùng thẳng data đã populate từ BE, không fetch lại
      if (fetchedPost.recommended_products?.length > 0) {
        const populated = fetchedPost.recommended_products.filter(
          (p) => p && typeof p === "object" && p._id,
        );

        if (populated.length > 0) {
          // BE đã populate → dùng luôn
          const mapped = populated.map((p) => ({
            ...p,
            id: p._id,
            slug: p.slug || p._id,
            image_url: Array.isArray(p.imageUrl)
              ? p.imageUrl[0]
              : p.imageUrl || p.image_url || null,
            stock: p.quantity ?? p.stock ?? 0,
          }));
          setRecommendedProducts(mapped);
        }
      }

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
      setRelatedPosts(posts.filter((p) => p._id !== id).slice(0, 3));
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  };

  // Nhận mảng IDs → fetch từng product object
  const fetchRecommendedProducts = async (productIds) => {
    try {
      const responses = await Promise.all(
        productIds.map((pid) => axiosInstance.get(`/api/product/${pid}`)),
      );
      const products = responses
        .map((res) => res.data.data || res.data)
        .filter(Boolean)
        .map((p) => ({
          ...p,
          id: p._id || p.id,
          slug: p.slug || p._id,
          image_url: Array.isArray(p.imageUrl)
            ? p.imageUrl[0]
            : p.image_url || p.imageUrl || null,
          stock: p.quantity ?? p.stock ?? 0,
        }));
      setRecommendedProducts(products);
    } catch (err) {
      console.error("Error fetching recommended products:", err);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedToCart((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const formatVND = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

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
            {post.image || post.thumbnail ? (
              <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <img
                  src={post.image || post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center bg-gray-100 text-gray-400">
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
                <span className="text-sm font-medium">Không có ảnh</span>
              </div>
            )}

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

              <div className="border-b border-gray-200 mb-8" />

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

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                  Sản Phẩm Liên Quan
                </h2>
                <span className="px-3 py-1 bg-pink-100 text-pink-600 text-sm font-bold rounded-full">
                  {recommendedProducts.length} sản phẩm
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => {
                  const imageUrl =
                    product.image_url ||
                    product.imageUrl ||
                    product.images?.[0] ||
                    product.image ||
                    product.thumbnail;
                  const displayPrice = product.sale_price || product.price;
                  const originalPrice = product.sale_price
                    ? product.price
                    : product.originalPrice;
                  const discountPercent =
                    originalPrice && displayPrice
                      ? Math.round((1 - displayPrice / originalPrice) * 100)
                      : 0;

                  return (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug || product._id}`}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
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

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                            Được đề xuất
                          </span>
                          {discountPercent > 0 && (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-1">
                        {(() => {
                          const isObjectId = (val) =>
                            typeof val === "string" &&
                            /^[a-f0-9]{24}$/i.test(val);
                          const brandName =
                            product.brand?.name &&
                            !isObjectId(product.brand.name)
                              ? product.brand.name
                              : typeof product.brand === "string" &&
                                  !isObjectId(product.brand)
                                ? product.brand
                                : null;
                          return brandName ? (
                            <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide mb-1">
                              {brandName}
                            </p>
                          ) : null;
                        })()}
                        <h3 className="text-base font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">
                            ({product.reviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4 mt-auto">
                          {displayPrice != null && (
                            <span className="text-xl font-black text-pink-600">
                              {formatVND(displayPrice)}
                            </span>
                          )}
                          {originalPrice && originalPrice > displayPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatVND(originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                            addedToCart[product._id]
                              ? "bg-green-500 text-white"
                              : "bg-pink-500 hover:bg-pink-600 text-white"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {addedToCart[product._id]
                            ? "Đã thêm vào giỏ!"
                            : "Thêm vào giỏ"}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {relatedPost.image || relatedPost.thumbnail ? (
                        <img
                          src={relatedPost.image || relatedPost.thumbnail}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
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

      {/* Custom Styles — fixed: removed jsx prop */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600;700&display=swap");

        h1, h2, h3 { font-family: "Montserrat", sans-serif; }

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
        .article-content p { margin-bottom: 1.5rem; }
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
        .article-content .highlight-box p:last-child { margin-bottom: 0; }
        .article-content strong { color: #ec4899; font-weight: 700; }
        .article-content em { color: #6b7280; font-style: italic; }
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
