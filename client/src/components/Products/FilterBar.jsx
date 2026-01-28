import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Calendar, ShoppingBag } from "lucide-react";

export function FilterBar({ onFilterChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);

  const categories = [
    { id: "sua-bau", label: "Sữa bầu" },
    { id: "sua-0-6-thang", label: "Sữa cho bé 0-6 tháng" },
    { id: "sua-1-3-tuoi", label: "Sữa cho bé 1-3 tuổi" },
    { id: "sua-6-12-thang", label: "Sữa cho bé 6-12 tháng" },
    { id: "sua-tren-3-tuoi", label: "Sữa cho bé trên 3 tuổi" },
  ];

  // Các loại sản phẩm
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

  const brands = [
    {
      id: 1,
      name: "Abbott",
      imagePath: "/labels/abbottgrow.webp",
      country: "Hoa Kỳ",
    },
    {
      id: 2,
      name: "Alphagen",
      imagePath: "/labels/alphagen.webp",
      country: "Úc",
    },
    {
      id: 4,
      name: "Blackmores",
      imagePath: "/labels/blackmores.webp",
      country: "Úc",
    },
    {
      id: 5,
      name: "ColosBaby",
      imagePath: "/labels/colosbaby.webp",
      country: "Việt Nam",
    },
    {
      id: 7,
      name: "Ensure",
      imagePath: "/labels/ensure.webp",
      country: "Hoa Kỳ",
    },
    {
      id: 8,
      name: "Friso",
      imagePath: "/labels/frisogold-pro.webp",
      country: "Hà Lan",
    },
    {
      id: 9,
      name: "Glico",
      imagePath: "/labels/glico.webp",
      country: "Nhật Bản",
    },
    {
      id: 10,
      name: "Hikid",
      imagePath: "/labels/hikid.webp",
      country: "Hàn Quốc",
    },
    {
      id: 11,
      name: "Meiji",
      imagePath: "/labels/meiji.webp",
      country: "Nhật Bản",
    },
    {
      id: 12,
      name: "Morinaga",
      imagePath: "/labels/morinaga.webp",
      country: "Nhật Bản",
    },
    {
      id: 13,
      name: "Nestlé",
      imagePath: "/labels/nan.webp",
      country: "Thụy Sĩ",
    },
    {
      id: 15,
      name: "Vinamilk",
      imagePath: "/labels/colosgold.webp",
      country: "Việt Nam",
    },
    {
      id: 16,
      name: "Yokogold",
      imagePath: "/labels/yokogold.webp",
      country: "Nhật Bản",
    },
  ];

  const handleCategoryChange = (categoryId) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updated);
    onFilterChange?.({
      categories: updated,
      brands: selectedBrands,
      productTypes: selectedProductTypes,
    });
  };

  const handleBrandChange = (brandId) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);
    onFilterChange?.({
      categories: selectedCategories,
      brands: updated,
      productTypes: selectedProductTypes,
    });
  };

  const handleProductTypeChange = (typeId) => {
    const updated = selectedProductTypes.includes(typeId)
      ? selectedProductTypes.filter((id) => id !== typeId)
      : [...selectedProductTypes, typeId];
    setSelectedProductTypes(updated);
    onFilterChange?.({
      categories: selectedCategories,
      brands: selectedBrands,
      productTypes: updated,
    });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    onFilterChange?.({ categories: [], brands: [], productTypes: [] });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedProductTypes.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Bộ lọc */}
      <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
        Bộ lọc
      </h3>

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
                      isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  ></span>
                </span>
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  {category.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Thương hiệu */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Thương hiệu
        </h4>

        {/* Logo thương hiệu để chọn */}
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
                />
              </div>
            );
          })}
        </div>
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
