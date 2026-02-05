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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { useState } from "react";
import NewBrandDialog from "./NewBrandDialog";
import NewCategoryDialog from "./NewCategoryDialog";

export default function NewProductDialog({
  isOpen,
  onClose,
  newProduct,
  setNewProduct,
  categories,
  brands,
  onCreateProduct,
}) {
  const handleClose = () => {
    onClose();
    setNewProduct({
      product_code: "",
      name: "",
      short_description: "",
      price: 0,
      discount_end_datetime: null,
      stock: 0,
      is_active: true,
      category_id: "",
      brand_id: "",
    });
    setImagePreview(null);
  };
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", description: "" });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Store the file in newProduct state
      setNewProduct({ ...newProduct, image: file });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Top Section: Image Upload + Product Info */}
          <div className="grid grid-cols-[280px_1fr] gap-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 flex flex-col items-center gap-3 bg-background">
                <div className="w-full aspect-square rounded-lg border-2 border-muted bg-muted/10 overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ảnh sản phẩm</p>
                    </div>
                  )}
                </div>
                <label className="w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <span className="block w-full text-center px-3 py-2 rounded-md border border-input text-sm font-medium cursor-pointer hover:bg-accent transition">
                    Chọn ảnh
                  </span>
                </label>
                <p className="text-xs text-muted-foreground text-center">
                  Dung lượng file tối đa 1MB
                  <br />
                  Định dạng .JPEG, .PNG
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Product Code + Name */}
              <div className="grid grid-cols-[160px_1fr] gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-product-code">
                    Mã sản phẩm<span className="text-red-700">*</span>
                  </Label>
                  <Input
                    id="new-product-code"
                    placeholder="Product code"
                    value={newProduct.product_code}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        product_code: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-name">
                    Tên sản phẩm<span className="text-red-700">*</span>
                  </Label>
                  <Input
                    id="new-name"
                    placeholder="Product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Brand + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-brand">
                      Thương hiệu<span className="text-red-700">*</span>
                    </Label>
                    <Button
                      variant="link"
                      size="small"
                      onClick={() => setIsBrandDialogOpen(true)}
                      type="button"
                    >
                      Tạo mới
                    </Button>
                  </div>
                  <Select
                    value={newProduct.brand_id}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, brand_id: value })
                    }
                  >
                    <SelectTrigger id="new-brand" className="w-full">
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-category">
                      Danh mục<span className="text-red-700">*</span>
                    </Label>
                    <Button
                      variant="link"
                      size="small"
                      onClick={() => setIsCategoryDialogOpen(true)}
                      type="button"
                    >
                      Tạo mới
                    </Button>
                  </div>
                  <Select
                    value={newProduct.category_id}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category_id: value })
                    }
                  >
                    <SelectTrigger id="new-category" className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="new-description">Mô tả sản phẩm</Label>
                <Textarea
                  id="new-description"
                  placeholder="Description"
                  value={newProduct.short_description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      short_description: e.target.value,
                    })
                  }
                  className="min-h-25 resize-y max-h-[30vh]"
                  rows={4}
                />
              </div>

              {/* Price and Stock */}
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="new-stock">
                    Tồn kho<span className="text-red-700">*</span>
                  </Label>
                  <Input
                    id="new-stock"
                    type="number"
                    placeholder="Storage"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="new-price">
                    Giá (VND)<span className="text-red-700">*</span>
                  </Label>
                  <Input
                    id="new-price"
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price, Storage, Discount */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-4">
              <div className="flex gap-4"></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="new-is-active"
              checked={newProduct.is_active}
              onCheckedChange={(checked) =>
                setNewProduct({ ...newProduct, is_active: checked })
              }
            />
            <Label htmlFor="new-is-active">
              Hiển thị sản phẩm trên cửa hàng
            </Label>
          </div>
        </div>
        <DialogFooter className="items-center sm:justify-between">
          <div>
            <span className="text-red-700">*</span> Trường bắt buộc
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={onCreateProduct}
              disabled={
                !newProduct.product_code ||
                !newProduct.name ||
                !newProduct.category_id ||
                !newProduct.brand_id
              }
            >
              Tạo sản phẩm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <NewBrandDialog
        isOpen={isBrandDialogOpen}
        onClose={() => setIsBrandDialogOpen(false)}
        newBrand={newBrand}
        setNewBrand={setNewBrand}
        onCreateBrand={() => {
          // TODO: Handle brand creation
          console.log("Creating brand:", newBrand);
          setIsBrandDialogOpen(false);
        }}
      />

      <NewCategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onCreateCategory={() => {
          // TODO: Handle category creation
          console.log("Creating category:", newCategory);
          setIsCategoryDialogOpen(false);
        }}
      />
    </Dialog>
  );
}
