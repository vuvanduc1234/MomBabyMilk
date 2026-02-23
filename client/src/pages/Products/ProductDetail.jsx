import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Send,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProductDetail() {
  // ProductCard navigate tới /product/:slug và slug được map từ product._id
  // Nên param này thực chất là MongoDB _id
  const { id, slug } = useParams();
  const productId = id || slug; // hỗ trợ cả route /product/:id và /product/:slug
  const { addToCart } = useCart();
  const { user: currentUser } = useAuth();

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState({ rating: 5, content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState({ rating: 5, content: "" });
  const [commentError, setCommentError] = useState(null);

  // Lấy userId từ JWT token (nếu có)
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id || payload?.userId || payload?._id || null;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE}/api/product/${productId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Sản phẩm không tìm thấy");
          }
          throw new Error(
            `Lỗi ${response.status}: Không thể tải thông tin sản phẩm`,
          );
        }

        const json = await response.json();
        // API trả về { message: "...", data: { ... } }
        const productData = json.data || json;
        setProduct(productData);

        // Reset selectedImage về 0 khi load sản phẩm mới
        setSelectedImage(0);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const fetchComments = useCallback(async () => {
    // Backend không có GET /comments riêng, fetch lại product để lấy comments mới nhất
    try {
      setCommentsLoading(true);
      setCommentError(null);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/api/product/${productId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error("fetch failed");
      const json = await response.json();
      const productData = json.data || json;
      const fetchedComments = productData.comments || [];
      setComments(fetchedComments);
    } catch {
      setCommentError("Không thể tải đánh giá. Vui lòng thử lại.");
    } finally {
      setCommentsLoading(false);
    }
  }, [productId]);

  // Fetch comments khi chuyển sang tab reviews
  useEffect(() => {
    if (activeTab === "reviews" && productId) {
      fetchComments();
    }
  }, [activeTab, productId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.content.trim()) return;
    if (!localStorage.getItem("accessToken")) {
      setCommentError("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }
    try {
      setSubmitting(true);
      setCommentError(null);
      await axiosInstance.post(`/api/product/${productId}/comments`, {
        rating: newComment.rating,
        content: newComment.content.trim(),
      });
      setNewComment({ rating: 5, content: "" });
      // Reload lại từ product API để lấy comment đầy đủ (có createdAt, user info...)
      await fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.message || "Không thể gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.content.trim()) return;
    try {
      setCommentError(null);
      const res = await axiosInstance.put(
        `/api/product/${productId}/comments/${commentId}`,
        { rating: editContent.rating, content: editContent.content.trim() },
      );
      const updated = res.data.data || res.data;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, ...updated } : c)),
      );
      setEditingId(null);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Không thể cập nhật đánh giá.",
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      setCommentError(null);
      await axiosInstance.delete(
        `/api/product/${productId}/comments/${commentId}`,
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setCommentError(err.response?.data?.message || "Không thể xóa đánh giá.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Có lỗi xảy ra
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            to="/products"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Sản phẩm không tìm thấy
        </h1>
        <Link
          to="/products"
          className="text-pink-600 hover:text-pink-700 font-semibold"
        >
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  // Helper functions
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get available stock for display (API returns 'quantity')
  const stock = product.quantity || product.stock || 0;

  // Ensure quantity field exists (API returns 'quantity')
  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: stock,
    });
    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`);
  };

  // Xử lý images array - API trả về imageUrl (array)
  const rawImages = product.imageUrl || product.images || [];
  const productImages = Array.isArray(rawImages)
    ? rawImages.filter((img) => img && img.trim() !== "")
    : rawImages
      ? [rawImages]
      : [];

  const finalImages =
    productImages.length > 0
      ? productImages
      : [
          product.image_url ||
            "https://via.placeholder.com/800x600?text=No+Image",
        ];

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-pink-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-pink-600">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hình ảnh */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
              <img
                src={finalImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-contain p-4"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {finalImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx
                        ? "border-pink-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-20 object-contain p-1"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/200x200?text=No+Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            {/* Brand & Title */}
            {product.brand && (
              <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>

            {/* Giá */}
            <div className="mb-6 p-4 bg-pink-50 rounded-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-pink-600">
                  {formatVND(product.sale_price || product.price)}
                </span>
                {product.sale_price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatVND(product.price)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold">
                  Tiết kiệm -{discount}%
                </div>
              )}
            </div>

            {/* Tình trạng kho */}
            <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm">
                <span className="text-gray-600">Tình trạng: </span>
                <span
                  className={`font-semibold ${
                    stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stock > 0 ? `Còn ${stock} sản phẩm` : "Hết hàng"}
                </span>
              </p>
            </div>

            {/* Số lượng & Button */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 px-4"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border-x border-gray-300 py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="p-2 hover:bg-gray-50 px-4"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                </button>
              </div>
            </div>

            {/* Lợi ích */}
            <div className="space-y-3 mb-6">
              {[
                { icon: Truck, text: "Giao hàng toàn quốc" },
                { icon: Shield, text: "Hàng chính hãng 100%" },
                { icon: RotateCcw, text: "Đổi trả trong 7 ngày" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg mb-8 shadow-sm">
          <div className="flex border-b border-gray-200">
            {["description", "usage", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab === "description"
                  ? "Mô tả"
                  : tab === "usage"
                    ? "Hướng dẫn sử dụng"
                    : "Đánh giá"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {product.description ||
                    "Chưa có mô tả chi tiết cho sản phẩm này."}
                </p>

                {/* Thông tin chi tiết từ API */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {product.appropriateAge && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-500 font-medium mb-1">
                        Độ tuổi phù hợp
                      </p>
                      <p className="text-sm text-gray-700">
                        {product.appropriateAge}
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Khối lượng
                      </p>
                      <p className="text-sm text-gray-700">{product.weight}g</p>
                    </div>
                  )}
                  {product.manufacturer && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Nhà sản xuất
                      </p>
                      <p className="text-sm text-gray-700">
                        {product.manufacturer}
                      </p>
                    </div>
                  )}
                  {product.manufacture && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Ngày sản xuất
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(product.manufacture).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  )}
                  {product.expiry && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Hạn sử dụng
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(product.expiry).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bảo quản - API field: storageInstructions */}
                {(product.storageInstructions || product.storage) && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Bảo quản:
                    </h3>
                    <p className="text-gray-700">
                      {product.storageInstructions || product.storage}
                    </p>
                  </div>
                )}

                {/* Cảnh báo */}
                {product.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Lưu ý:</strong> {product.warning}
                    </p>
                  </div>
                )}

                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Công dụng chính:
                    </h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-pink-500 font-bold mt-1">
                            ✓
                          </span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4">
                {/* API field: instructionsForUse */}
                {product.instructionsForUse || product.usage ? (
                  <>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Hướng dẫn pha:</strong>{" "}
                      {product.instructionsForUse || product.usage}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Mẹo:</strong> Dùng nước lọc hoặc nước tinh
                        khiết để pha sữa sẽ tốt hơn.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Chưa có hướng dẫn sử dụng cho sản phẩm này.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Error */}
                {commentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {commentError}
                  </div>
                )}

                {/* Form gửi đánh giá */}
                {localStorage.getItem("accessToken") ? (
                  <div className="bg-pink-50 border border-pink-100 rounded-xl p-5">
                    <h3 className="font-bold text-gray-800 mb-4">
                      Viết đánh giá của bạn
                    </h3>
                    {/* Chọn sao */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setNewComment((p) => ({ ...p, rating: star }))
                          }
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 transition ${
                              star <= newComment.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {newComment.rating}/5
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={newComment.content}
                      onChange={(e) =>
                        setNewComment((p) => ({
                          ...p,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={submitting || !newComment.content.trim()}
                      className="mt-3 flex items-center gap-2 px-5 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm mb-2">
                      Đăng nhập để gửi đánh giá
                    </p>
                    <Link
                      to="/login"
                      className="text-pink-600 font-semibold text-sm hover:underline"
                    >
                      Đăng nhập ngay →
                    </Link>
                  </div>
                )}

                {/* Danh sách đánh giá */}
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 font-medium">
                      {comments.length} đánh giá
                    </p>
                    {comments.map((comment) => {
                      // Lấy ID của tác giả comment để xác định quyền sở hữu
                      const commentUserId =
                        comment.author?._id || comment.author;

                      const isOwner =
                        currentUserId &&
                        commentUserId &&
                        String(commentUserId) === String(currentUserId);

                      // Tên người comment: backend populate author.fullname, fallback về currentUser.name
                      const commenterName =
                        comment.author?.fullname ||
                        currentUser?.name ||
                        "Người dùng";

                      const isEditing = editingId === comment._id;

                      return (
                        <div
                          key={comment._id}
                          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {commenterName}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3.5 w-3.5 ${
                                      s <= (comment.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-200"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-400 ml-1">
                                  {comment.createdAt
                                    ? new Date(
                                        comment.createdAt,
                                      ).toLocaleDateString("vi-VN")
                                    : ""}
                                </span>
                              </div>
                            </div>
                            {/* Nút edit/delete - chỉ hiện với chủ comment */}
                            {isOwner && !isEditing && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingId(comment._id);
                                    setEditContent({
                                      rating: comment.rating || 5,
                                      content: comment.content || "",
                                    });
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                  title="Sửa"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Nội dung hoặc form edit */}
                          {isEditing ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() =>
                                      setEditContent((p) => ({
                                        ...p,
                                        rating: star,
                                      }))
                                    }
                                  >
                                    <Star
                                      className={`h-5 w-5 ${
                                        star <= editContent.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                rows={2}
                                value={editContent.content}
                                onChange={(e) =>
                                  setEditContent((p) => ({
                                    ...p,
                                    content: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateComment(comment._id)
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-lg transition"
                                >
                                  <Check className="h-3.5 w-3.5" /> Lưu
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition"
                                >
                                  <X className="h-3.5 w-3.5" /> Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed mt-1">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
