import React, { useState } from "react";
import { FilterBar } from "../../components/Products/FilterBar";
import { Search } from "lucide-react";
import { ProductCard } from "../../components/Products/ProductCard";

// Dữ liệu mẫu sản phẩm
const mockProducts = [
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

export default function ProductListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ categories: [], brands: [] });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesBrand =
      filters.brands.length === 0 ||
      filters.brands.includes(product.brand.id);

    return matchesSearch && matchesBrand;
  });

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

            {/* Product Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                sản phẩm
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
