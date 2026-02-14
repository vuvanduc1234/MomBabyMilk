import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function EditCategoryDialog({
  isOpen,
  onClose,
  category,
  brands,
  categories,
  onUpdateCategory,
}) {
  const [editedCategory, setEditedCategory] = useState({
    name: "",
    description: "",
    parentCategory: null,
  });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  const availableBrands = brands || [];
  const availableCategories = categories || [];

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setEditedCategory({
        name: category.name || "",
        description: category.description || "",
        parentCategory: category.parentCategory?._id || "",
      });

      // Set selected brands
      if (category.brands && Array.isArray(category.brands)) {
        setSelectedBrands(category.brands);
      } else {
        setSelectedBrands([]);
      }
    }
  }, [category]);

  // Filter out current category and its descendants to prevent circular references
  const getFilteredCategories = () => {
    if (!category) return availableCategories;

    // Get all descendant IDs recursively
    const getDescendantIds = (catId) => {
      const descendants = [];
      const findDescendants = (parentId) => {
        availableCategories.forEach((cat) => {
          if (cat.parentCategory?._id === parentId) {
            descendants.push(cat._id);
            findDescendants(cat._id);
          }
        });
      };
      findDescendants(catId);
      return descendants;
    };

    const descendantIds = getDescendantIds(category._id);
    const excludedIds = [category._id, ...descendantIds];

    return availableCategories.filter((cat) => !excludedIds.includes(cat._id));
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) => {
      const exists = prev.find((b) => b._id === brand._id);
      if (exists) {
        return prev.filter((b) => b._id !== brand._id);
      } else {
        return [...prev, brand];
      }
    });
  };

  const handleRemoveBrand = (brandId) => {
    setSelectedBrands((prev) => prev.filter((b) => b._id !== brandId));
  };

  const handleSubmit = async () => {
    if (!editedCategory.name || !editedCategory.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    // Prevent setting self as parent
    if (editedCategory.parentCategory === category._id) {
      toast.error("Danh mục không thể là cha của chính nó");
      return;
    }

    try {
      setIsUpdatingCategory(true);
      await onUpdateCategory(category._id, {
        ...editedCategory,
        brands: selectedBrands.map((b) => b._id),
      });
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleClose = () => {
    setEditedCategory({
      name: "",
      description: "",
      parentCategory: null,
    });
    setSelectedBrands([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label>
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nhập tên danh mục"
                value={editedCategory.name}
                onChange={(e) =>
                  setEditedCategory({ ...editedCategory, name: e.target.value })
                }
              />
            </div>

            {/* Brands Multi-Select */}
            <div className="space-y-2">
              <Label>Thương hiệu thuộc danh mục này (Chọn nhiều)</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      Tìm kiếm và thêm thương hiệu...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-103 mt-2 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm thương hiệu..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy thương hiệu.</CommandEmpty>
                      <CommandGroup>
                        {availableBrands.map((brand) => {
                          const isSelected = selectedBrands.some(
                            (b) => b._id === brand._id,
                          );
                          return (
                            <CommandItem
                              key={brand._id}
                              value={brand.name}
                              onSelect={() => handleBrandToggle(brand)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {brand.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Brands as Badges */}
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map((brand) => (
                    <Badge
                      key={brand._id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveBrand(brand._id)}
                    >
                      {brand.name}
                      <X data-icon="inline-end" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Parent Category */}
            <div className="space-y-2">
              <Label>Danh mục cha của danh mục này</Label>
              <Select
                value={editedCategory.parentCategory || "root"}
                onValueChange={(value) =>
                  setEditedCategory({
                    ...editedCategory,
                    parentCategory: value === "root" ? null : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục cha..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">(Mặc định: Danh mục gốc)</SelectItem>
                  {getFilteredCategories().map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Nhập mô tả danh mục..."
                value={editedCategory.description}
                onChange={(e) =>
                  setEditedCategory({
                    ...editedCategory,
                    description: e.target.value,
                  })
                }
                rows={8}
                className="max-h-100"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdatingCategory}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdatingCategory}>
            {isUpdatingCategory ? "Đang cập nhật..." : "Cập nhật danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
