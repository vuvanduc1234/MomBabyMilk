import { useState, useRef } from "react";
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
import { X, Upload, Check, ChevronsUpDown } from "lucide-react";
import { uploadBrandImage } from "../services/brandApi";
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
import { cn } from "@/lib/utils";

// Mock categories - replace with actual data from API
const mockCategories = [
  { id: "1", name: "Điện tử" },
  { id: "2", name: "Gia dụng" },
  { id: "3", name: "Thời trang" },
  { id: "4", name: "Mỹ phẩm" },
  { id: "5", name: "Thực phẩm" },
];

export default function NewBrandDialog({
  isOpen,
  onClose,
  newBrand,
  setNewBrand,
  onCreateBrand,
  categories,
}) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [open, setOpen] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Use categories from props, fallback to mock data
  const availableCategories = categories || mockCategories;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (1MB to match server limit)
      if (file.size > 1024 * 1024) {
        toast.error("Dung lượng file không được vượt quá 1MB");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file .JPEG hoặc .PNG");
        return;
      }

      try {
        setIsUploadingImage(true);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const response = await uploadBrandImage(file);

        if (response?.data?.logoUrl) {
          setNewBrand({
            ...newBrand,
            logo: file,
            logoUrl: response.data.logoUrl,
          });
          toast.success("Tải logo lên thành công!");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast.error(
          error.message || "Không thể tải logo lên. Vui lòng thử lại.",
        );
        setLogoPreview(null);
        setNewBrand({ ...newBrand, logo: null, logoUrl: "" });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleClose = () => {
    onClose();
    setNewBrand({
      name: "",
      description: "",
      logoUrl: "",
      categories: [],
    });
    setSelectedCategories([]);
    setLogoPreview(null);
  };

  const handleCreate = () => {
    const categoryIds = selectedCategories.map((cat) => cat._id || cat.id);
    onCreateBrand({ ...newBrand, categories: categoryIds, selectedCategories });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tạo thương hiệu mới</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="brand-name">
                Tên thương hiệu<span className="text-red-700">*</span>
              </Label>
              <Input
                id="brand-name"
                placeholder="Nhập tên thương hiệu"
                value={newBrand.name}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, name: e.target.value })
                }
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo thương hiệu</Label>
              <div className="space-y-3 flex flex-col mt-4">
                <div className="w-50 aspect-square rounded-lg border-2 border-dashed bg-muted/10 overflow-hidden flex items-center self-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Logo thương hiệu</p>
                    </div>
                  )}
                </div>
                <label htmlFor="file-upload-brand" className="w-full">
                  <input
                    id="file-upload-brand"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploadingImage}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isUploadingImage}
                    asChild
                    type="button"
                  >
                    <span className="cursor-pointer">
                      {isUploadingImage ? "Đang tải lên..." : "Chọn logo"}
                    </span>
                  </Button>
                </label>
                {logoPreview && (
                  <Button
                    variant="link"
                    size="small"
                    onClick={() => {
                      setLogoPreview(null);
                      setNewBrand({ ...newBrand, logo: null, logoUrl: "" });
                    }}
                    type="button"
                    className="cursor-pointer w-full"
                  >
                    Xóa logo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Dung lượng file tối đa 1MB
                  <br />
                  Định dạng .JPEG, .PNG
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="space-y-2">
              <Label>Danh mục kinh doanh (Chọn nhiều)</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length} danh mục đã chọn`
                      : "Chọn danh mục..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-104 p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm danh mục..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy danh mục</CommandEmpty>
                      <CommandGroup>
                        {availableCategories.map((category) => {
                          const categoryId = category._id || category.id;
                          const isSelected = selectedCategories.some(
                            (c) => (c._id || c.id) === categoryId,
                          );
                          return (
                            <CommandItem
                              key={categoryId}
                              value={category.name}
                              onSelect={() => {
                                if (isSelected) {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (c) => (c._id || c.id) !== categoryId,
                                    ),
                                  );
                                } else {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    category,
                                  ]);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat._id || cat.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter(
                            (c) => (c._id || c.id) !== (cat._id || cat.id),
                          ),
                        )
                      }
                    >
                      {cat.name}
                      <X data-icon="inline-end" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="brand-description">Mô tả</Label>
              <Textarea
                id="brand-description"
                placeholder="Nhập mô tả thương hiệu..."
                value={newBrand.description}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, description: e.target.value })
                }
                rows={3}
                className="resize-y overflow-auto max-h-100"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploadingImage}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              isCreatingBrand || isUploadingImage || !newBrand.name.trim() || !newBrand.logoUrl
            }
          >
            {isUploadingImage ? "Đang tải logo..." : "Tạo thương hiệu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
