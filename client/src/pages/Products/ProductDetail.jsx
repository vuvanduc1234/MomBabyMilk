import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProductDetail() {
  // ProductCard navigate tới /product/:slug và slug được map từ product._id
  // Nên param này thực chất là MongoDB _id
  const { id, slug } = useParams();
  const productId = id || slug; // hỗ trợ cả route /product/:id và /product/:slug
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

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

  // Normalize fields: API dùng quantity & imageUrl
  const stock = product.quantity ?? product.stock ?? 0;

  const handleAddToCart = () => {
    addToCart({ ...product, stock });
    alert(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`);
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
                className="w-full h-96 object-cover"
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
                      className="w-full h-20 object-cover"
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

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 0}/5 ({product.reviews || 0} đánh giá)
              </span>
            </div>

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
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-6 py-3 rounded-lg font-semibold border-2 transition ${
                    isWishlisted
                      ? "border-pink-500 text-pink-500 bg-pink-50"
                      : "border-gray-300 text-gray-600 hover:border-pink-300"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-pink-500" : ""}`}
                  />
                </button>
                <button className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition">
                  <Share2 className="h-5 w-5" />
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
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">
                  Chưa có đánh giá nào cho sản phẩm này.
                </p>
                {/* TODO: Tích hợp API reviews sau */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
