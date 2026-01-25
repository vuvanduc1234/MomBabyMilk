import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FilterBar({ onFilterChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const categories = [
    { id: "sua-bau", label: "Sữa bầu" },
    { id: "sua-0-6-thang", label: "Sữa cho bé 0-6 tháng" },
    { id: "sua-1-3-tuoi", label: "Sữa cho bé 1-3 tuổi" },
    { id: "sua-6-12-thang", label: "Sữa cho bé 6-12 tháng" },
    { id: "sua-tren-3-tuoi", label: "Sữa cho bé trên 3 tuổi" },
  ];

  const brands = [
    { id: "abbott", label: "Abbott", country: "Hoa Kỳ" },
    { id: "friso", label: "Friso", country: "Hà Lan" },
    { id: "meiji", label: "Meiji", country: "Nhật Bản" },
    { id: "nestle", label: "Nestlé", country: "Thụy Sĩ" },
    { id: "vinamilk", label: "Vinamilk", country: "Việt Nam" },
  ];

  const handleCategoryChange = (categoryId) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updated);
    onFilterChange?.({ categories: updated, brands: selectedBrands });
  };

  const handleBrandChange = (brandId) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);
    onFilterChange?.({ categories: selectedCategories, brands: updated });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    onFilterChange?.({ categories: [], brands: [] });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedBrands.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Bộ lọc */}{" "}
      <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
        Bộ lọc
      </h3>
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
        <div className="space-y-3">
          {brands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.id);
            return (
              <label
                key={brand.id}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandChange(brand.id)}
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
                  {brand.label}{" "}
                  <span className="text-gray-400">({brand.country})</span>
                </span>
              </label>
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
            Xóa tất cả bộ lọc ({selectedCategories.length + selectedBrands.length})
          </button>
        </div>
      )}
    </div>
  );
}
