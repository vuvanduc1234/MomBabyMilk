import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, Calendar, ShoppingBag } from "lucide-react";

export function FilterBar({ onFilterChange, onProductsUpdate }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const productTypes = [
    {
      id: "in-stock",
      label: "Hàng có sẵn",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "out-of-stock-preorder",
      label: "Đặt trước - Hết hàng",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "coming-soon-preorder",
      label: "Đặt trước - Sắp ra mắt",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/category");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Có thể thêm thông báo lỗi cho user ở đây
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands từ API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const response = await fetch("/api/brand");

        if (!response.ok) {
          throw new Error("Failed to fetch brands");
        }

        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
        // Có thể thêm thông báo lỗi cho user ở đây
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch("/api/product");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      onProductsUpdate?.(data, null);
      return data;
    } catch (error) {
      console.error("Error fetching all products:", error);
      onProductsUpdate?.([]);
      return [];
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (categoryId) => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`/api/product/category/${categoryId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products by category");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch products by brand
  const fetchProductsByBrand = async (brandId) => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`/api/product/brand/${brandId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products by brand");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products by brand:", error);
      return [];
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Apply filters and fetch products
  const applyFilters = async (categories, brands, productTypes) => {
    try {
      setIsLoadingProducts(true);
      let allProducts = [];

      // Nếu không có filter nào được chọn, lấy tất cả sản phẩm
      if (categories.length === 0 && brands.length === 0) {
        allProducts = await fetchAllProducts();
      } else {
        // Fetch products theo category
        if (categories.length > 0) {
          const categoryPromises = categories.map((categoryId) =>
            fetchProductsByCategory(categoryId),
          );
          const categoryResults = await Promise.all(categoryPromises);
          allProducts = categoryResults.flat();
        }

        // Fetch products theo brand
        if (brands.length > 0) {
          const brandPromises = brands.map((brandId) =>
            fetchProductsByBrand(brandId),
          );
          const brandResults = await Promise.all(brandPromises);
          const brandProducts = brandResults.flat();

          // Nếu có cả category và brand, lấy giao của 2 tập hợp
          if (categories.length > 0) {
            const brandProductIds = new Set(brandProducts.map((p) => p.id));
            allProducts = allProducts.filter((p) => brandProductIds.has(p.id));
          } else {
            allProducts = brandProducts;
          }
        }

        // Loại bỏ sản phẩm trùng lặp
        const uniqueProducts = Array.from(
          new Map(allProducts.map((item) => [item.id, item])).values(),
        );
        allProducts = uniqueProducts;
      }

      // Lọc theo product types (in-stock, preorder, etc.) - client-side filtering
      if (productTypes.length > 0) {
        allProducts = allProducts.filter((product) => {
          // Logic lọc theo productTypes tùy thuộc vào cấu trúc dữ liệu của bạn
          // Ví dụ: giả sử product có field "status"
          return productTypes.some((typeId) => {
            if (typeId === "in-stock") {
              return product.inStock === true || product.status === "in-stock";
            }
            if (typeId === "out-of-stock-preorder") {
              return (
                (product.inStock === false && product.preorder === true) ||
                product.status === "out-of-stock-preorder"
              );
            }
            if (typeId === "coming-soon-preorder") {
              return (
                product.comingSoon === true ||
                product.status === "coming-soon-preorder"
              );
            }
            return false;
          });
        });
      }

      onProductsUpdate?.(allProducts);
    } catch (error) {
      console.error("Error applying filters:", error);
      onProductsUpdate?.([], "Không thể tải sản phẩm");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Load all products on initial mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleCategoryChange = (categoryId) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updated);

    // Call the legacy callback if provided
    onFilterChange?.({
      categories: updated,
      brands: selectedBrands,
      productTypes: selectedProductTypes,
    });

    // Apply filters with API calls
    applyFilters(updated, selectedBrands, selectedProductTypes);
  };

  const handleBrandChange = (brandId) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);

    // Call the legacy callback if provided
    onFilterChange?.({
      categories: selectedCategories,
      brands: updated,
      productTypes: selectedProductTypes,
    });

    // Apply filters with API calls
    applyFilters(selectedCategories, updated, selectedProductTypes);
  };

  const handleProductTypeChange = (typeId) => {
    const updated = selectedProductTypes.includes(typeId)
      ? selectedProductTypes.filter((id) => id !== typeId)
      : [...selectedProductTypes, typeId];
    setSelectedProductTypes(updated);

    // Call the legacy callback if provided
    onFilterChange?.({
      categories: selectedCategories,
      brands: selectedBrands,
      productTypes: updated,
    });

    // Apply filters with API calls
    applyFilters(selectedCategories, selectedBrands, updated);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProductTypes([]);

    // Call the legacy callback if provided
    onFilterChange?.({ categories: [], brands: [], productTypes: [] });

    // Fetch all products when clearing filters
    fetchAllProducts();
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedProductTypes.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 relative">
      {/* Loading overlay */}
      {isLoadingProducts && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
        </div>
      )}

      {/* Bộ lọc */}
      <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
        Bộ lọc
      </h3>

      {/* Nút xem tất cả sản phẩm */}
      <button
        onClick={fetchAllProducts}
        disabled={isLoadingProducts}
        className="w-full mb-6 py-3 px-4 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        <ShoppingBag className="h-4 w-4" />
        Xem Tất Cả Sản Phẩm
      </button>

      {/* Loại sản phẩm */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Loại sản phẩm
        </h4>
        <div className="space-y-2">
          {productTypes.map((type) => {
            const isChecked = selectedProductTypes.includes(type.id);
            const Icon = type.icon;
            return (
              <label
                key={type.id}
                className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  isChecked
                    ? `border-pink-400 ${type.bgColor}`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleProductTypeChange(type.id)}
                  className="sr-only"
                />
                <div
                  className={`flex items-center gap-2 flex-1 ${isChecked ? type.color : "text-gray-600"}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <span
                  className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                    isChecked
                      ? "border-pink-400 bg-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <span
                    className={`w-3 h-3 bg-pink-400 rounded-full transition-all ${
                      isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  ></span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Danh mục */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Danh mục
        </h4>

        {/* Loading state for categories */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Không có danh mục nào
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const isChecked = selectedCategories.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(category.id)}
                    className="sr-only"
                  />
                  <span
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all mr-3 ${
                      isChecked
                        ? "border-pink-400 bg-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 bg-pink-400 rounded-full transition-all ${
                        isChecked
                          ? "scale-100 opacity-100"
                          : "scale-0 opacity-0"
                      }`}
                    ></span>
                  </span>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    {category.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Thương hiệu */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Thương hiệu
        </h4>

        {/* Loading state */}
        {isLoadingBrands ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Không có thương hiệu nào
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => {
              const isChecked = selectedBrands.includes(brand.id);
              return (
                <div
                  key={brand.id}
                  onClick={() => handleBrandChange(brand.id)}
                  className={`w-20 h-14 border bg-white rounded-md flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                    isChecked
                      ? "ring-2 ring-primary"
                      : "hover:ring-1 hover:ring-primary"
                  }`}
                >
                  <img
                    src={brand.imagePath}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Fallback nếu ảnh không load được
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<span class="text-xs text-gray-600 px-2 text-center">${brand.name}</span>`;
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Xóa tất cả bộ lọc */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={handleClearAll}
            className="w-full py-2.5 px-4 text-sm font-medium bg-pink-50 text-pink-500 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer"
          >
            Xóa tất cả bộ lọc (
            {selectedCategories.length +
              selectedBrands.length +
              selectedProductTypes.length}
            )
          </button>
        </div>
      )}
    </div>
  );
}
