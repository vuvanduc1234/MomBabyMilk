// src/pages/Products/ProductListing.jsx
import React, { useState, useEffect } from "react";
import { FilterBar } from "../../components/Products/FilterBar";
import { ProductCard } from "../../components/Products/ProductCard";

export default function ProductListing() {
  const [products, setProducts] = useState([]); // Danh sách sản phẩm thực tế từ API
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading toàn trang
  const [error, setError] = useState(null);

  // Callback nhận danh sách sản phẩm đã lọc từ FilterBar
  const handleProductsUpdate = (updatedProducts, err = null) => {
    if (err) {
      setError(err);
      setIsLoading(false);
      return;
    }

    setProducts(updatedProducts);
    setError(null); // clear error nếu load lại OK
    setIsLoading(false);
  };

  // Optional: Nếu muốn hiển thị loading/error riêng ở trang chính
  useEffect(() => {
    // Ban đầu có thể để FilterBar tự load all products
    // Không cần fetch thêm ở đây nữa
  }, []);

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
            <FilterBar
              onFilterChange={(filters) => {
                // Nếu bạn vẫn muốn lưu filters ở parent để dùng sau (ví dụ: hiển thị ở header)
                console.log("Current filters:", filters);
              }}
              onProductsUpdate={handleProductsUpdate} // <-- Quan trọng: nhận products đã lọc
            />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <p className="ml-4 text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600">
                <p className="text-lg">Có lỗi xảy ra khi tải sản phẩm</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            ) : (
              <>
                {/* Product Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Tìm thấy{" "}
                    <span className="font-semibold text-gray-800">
                      {products.length}
                    </span>{" "}
                    sản phẩm
                  </p>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
