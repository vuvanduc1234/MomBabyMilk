// src/pages/Products/ProductListing.jsx (Updated with Product Type Filters)
import React, { useState } from "react";
import { FilterBar } from "../../components/Products/FilterBar";
import { Search } from "lucide-react";
import { ProductCard } from "../../components/Products/ProductCard";

// Dữ liệu mẫu sản phẩm (bao gồm pre-order)
const mockProducts = [
  // Sản phẩm bình thường
  {
    id: 1,
    name: "Similac Mom IQ Plus",
    price: 650000,
    sale_price: 580000,
    slug: "similac-mom-iq-plus",
    image_url:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80",
    brand: { id: 1, name: "Abbott" },
    is_featured: true,
    stock: 10,
    reviews: 0,
  },
  {
    id: 2,
    name: "Frisomum Gold",
    price: 720000,
    sale_price: null,
    slug: "frisomum-gold",
    image_url:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80",
    brand: { id: 8, name: "Friso" },
    is_featured: true,
    stock: 15,
    reviews: 0,
  },
  // Sản phẩm đặt trước - HẾT HÀNG (Loại 1)
  {
    id: 7,
    name: "Abbott Grow Gold Limited Edition",
    price: 550000,
    sale_price: 520000,
    slug: "abbott-grow-gold-limited",
    image_url:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80",
    brand: { id: 1, name: "Abbott" },
    is_featured: true,
    stock: 0, // HẾT HÀNG
    reviews: 0,
    // Không có releaseDate = sản phẩm đã phát hành nhưng hết hàng
  },
  {
    id: 8,
    name: "Vinamilk Dielac Alpha Gold Premium",
    price: 480000,
    sale_price: 450000,
    slug: "vinamilk-dielac-alpha-premium",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
    brand: { id: 15, name: "Vinamilk" },
    is_featured: false,
    stock: 0, // HẾT HÀNG
    reviews: 0,
  },
  // Sản phẩm đặt trước - SẮP RA MẮT (Loại 2)
  {
    id: 9,
    name: "Meiji Infant Formula 2025 New Formula",
    price: 750000,
    sale_price: null,
    slug: "meiji-infant-2025",
    image_url:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    brand: { id: 11, name: "Meiji" },
    is_featured: true,
    stock: 0,
    reviews: 0,
    releaseDate: "2026-02-15", // Ngày phát hành trong tương lai
  },
  {
    id: 10,
    name: "Nestlé NAN Optipro Supreme 2026",
    price: 680000,
    sale_price: null,
    slug: "nestle-nan-supreme-2026",
    image_url:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    brand: { id: 13, name: "Nestlé" },
    is_featured: true,
    stock: 0,
    reviews: 0,
    releaseDate: "2026-03-01", // Ngày phát hành trong tương lai
  },
  {
    id: 11,
    name: "Friso Gold 5 Next Generation",
    price: 820000,
    sale_price: null,
    slug: "friso-gold-5-next-gen",
    image_url:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80",
    brand: { id: 8, name: "Friso" },
    is_featured: true,
    stock: 0,
    reviews: 0,
    releaseDate: "2026-02-28", // Ngày phát hành trong tương lai
  },
  // Thêm sản phẩm bình thường
  {
    id: 3,
    name: "Vinamilk Dielac Mama Gold",
    price: 420000,
    sale_price: 380000,
    slug: "vinamilk-dielac-mama-gold",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
    brand: { id: 15, name: "Vinamilk" },
    is_featured: false,
    stock: 20,
    reviews: 0,
  },
  {
    id: 4,
    name: "Abbott Grow Gold",
    price: 500000,
    sale_price: 450000,
    slug: "abbott-grow-gold",
    image_url:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80",
    brand: { id: 1, name: "Abbott" },
    is_featured: false,
    stock: 8,
    reviews: 0,
  },
  {
    id: 5,
    name: "Meiji Infant Formula",
    price: 680000,
    sale_price: null,
    slug: "meiji-infant-formula",
    image_url:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    brand: { id: 11, name: "Meiji" },
    is_featured: true,
    stock: 12,
    reviews: 0,
  },
  {
    id: 6,
    name: "Nestlé NAN Optipro",
    price: 550000,
    sale_price: 495000,
    slug: "nestle-nan-optipro",
    image_url:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    brand: { id: 13, name: "Nestlé" },
    is_featured: false,
    stock: 25,
    reviews: 0,
  },
];

// Helper function để xác định loại sản phẩm
const getProductType = (product) => {
  if (product.stock > 0) {
    return "in-stock";
  } else if (
    product.releaseDate &&
    new Date(product.releaseDate) > new Date()
  ) {
    return "coming-soon-preorder";
  } else if (product.stock === 0) {
    return "out-of-stock-preorder";
  }
  return "in-stock";
};

export default function ProductListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    productTypes: [],
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesBrand =
      filters.brands.length === 0 || filters.brands.includes(product.brand.id);

    // Lọc theo loại sản phẩm
    const productType = getProductType(product);
    const matchesProductType =
      filters.productTypes.length === 0 ||
      filters.productTypes.includes(productType);

    return matchesSearch && matchesBrand && matchesProductType;
  });

  // Đếm số lượng từng loại sản phẩm
  const productTypeCounts = {
    inStock: mockProducts.filter((p) => getProductType(p) === "in-stock")
      .length,
    outOfStock: mockProducts.filter(
      (p) => getProductType(p) === "out-of-stock-preorder",
    ).length,
    comingSoon: mockProducts.filter(
      (p) => getProductType(p) === "coming-soon-preorder",
    ).length,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">Sản phẩm</span>
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Filter */}
          <div className="col-span-3 sticky top-48 self-start">
            <FilterBar onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Search Bar */}
            <div className="mb-6 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
              <button className="px-8 py-3 bg-pink-400 text-white font-medium rounded-full hover:bg-pink-500 transition-colors shadow-md">
                Tìm kiếm
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Hàng có sẵn</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {productTypeCounts.inStock}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Đặt trước - Hết hàng
                  </span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {productTypeCounts.outOfStock}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Sắp ra mắt</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {productTypeCounts.comingSoon}
                </span>
              </div>
            </div>

            {/* Product Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                sản phẩm
                {filters.productTypes.length > 0 && (
                  <span className="ml-2 text-sm text-pink-600">
                    (đã lọc theo loại sản phẩm)
                  </span>
                )}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào phù hợp
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
