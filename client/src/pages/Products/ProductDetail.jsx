import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

// Mock data - all products
const allProducts = [
  {
    id: 1,
    name: "Similac Mom IQ Plus",
    brand: { name: "Abbott" },
    price: 650000,
    sale_price: 580000,
    rating: 4.5,
    reviews: 234,
    stock: 15,
    image_url:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
    ],
    description:
      "Sữa bột cho mẹ mang thai và sau sinh, công thức Optipro giàu DHA, tăng cường miễn dịch cho mẹ và bé.",
    benefits: [
      "DHA & ARA: Hỗ trợ phát triển não bộ",
      "Lactic Acid: Dễ tiêu hóa",
      "Vitamin & Khoáng chất: Tăng cường miễn dịch",
      "Choline: Phát triển trí não",
    ],
    usage:
      "Pha 4 thìa sữa (khoảng 30g) với 200ml nước ấm 40-50°C. Hỗn hợp tốt trước khi sử dụng.",
    storage: "Bảo quản ở nơi mát, khô ráo. Tránh để bị ẩm.",
    slug: "similac-mom-iq-plus",
  },
  {
    id: 2,
    name: "Frisomum Gold",
    brand: { name: "Friso" },
    price: 720000,
    sale_price: null,
    rating: 4.8,
    reviews: 156,
    stock: 15,
    image_url:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    ],
    description:
      "Sữa bột cho mẹ mang thai, công thức Frisomum Gold chứa canxi cao và DHA.",
    benefits: [
      "Canxi cao: Hỗ trợ xương khỏe",
      "DHA & ARA: Phát triển não bộ",
      "Nucleotide: Tăng cường miễn dịch",
      "Probiotic: Cải thiện tiêu hóa",
    ],
    usage:
      "Pha 4 thìa sữa (khoảng 28g) với 200ml nước ấm. Khuấy đều trước khi sử dụng.",
    storage: "Bảo quản ở nơi mát, khô ráo, tránh ánh nắng trực tiếp.",
    slug: "frisomum-gold",
  },
  {
    id: 3,
    name: "Vinamilk Dielac Mama Gold",
    brand: { name: "Vinamilk" },
    price: 420000,
    sale_price: 380000,
    rating: 4.3,
    reviews: 98,
    stock: 20,
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
    ],
    description:
      "Sữa bột cho mẹ mang thai, hỗ trợ phát triển thai nhi và sức khỏe mẹ.",
    benefits: [
      "DHA & ARA: Phát triển não bộ thai nhi",
      "Acid Folic: Phòng chống dị tật",
      "Sắt & Canxi: Hỗ trợ máu và xương",
      "Probiotic: Tăng cường tiêu hóa",
    ],
    usage:
      "Pha 4 thìa sữa (khoảng 30g) với 200ml nước ấm. Vẩy kỹ để hòa tan đều.",
    storage: "Bảo quản trong tủ lạnh sau khi mở hộp, dùng trong vòng 3 tuần.",
    slug: "vinamilk-dielac-mama-gold",
  },
];

const mockReviews = [
  {
    id: 1,
    author: "Nguyễn Thị A",
    rating: 5,
    date: "2024-01-15",
    comment: "Sản phẩm chất lượng, giao hàng nhanh, cực kỳ hài lòng!",
    verified: true,
  },
  {
    id: 2,
    author: "Trần Văn B",
    rating: 4,
    date: "2024-01-10",
    comment: "Tốt nhưng giá hơi cao so với ngoài chợ.",
    verified: true,
  },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Lấy sản phẩm từ slug
  const product = allProducts.find((p) => p.slug === slug);

  // Nếu không tìm thấy sản phẩm
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

  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    alert(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`);
  };

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

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Hình ảnh */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
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
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            {/* Brand & Title */}
            <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews} đánh giá)
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
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : "Hết hàng"}
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
                    className="p-2 hover:bg-gray-50"
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
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ
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
        <div className="bg-white rounded-lg mb-8">
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
                  {product.description}
                </p>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Công dụng chính:
                  </h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-pink-500 font-bold mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Bảo quản:
                  </h3>
                  <p className="text-gray-700">{product.storage}</p>
                </div>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Hướng dẫn pha:</strong> {product.usage}
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Mẹo:</strong> Dùng nước lọc hoặc nước tinh khiết
                    để pha sữa sẽ tốt hơn.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.author}
                          {review.verified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Đã mua
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
