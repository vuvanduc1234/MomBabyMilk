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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldDescription } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleQuestionMarkIcon, Package } from "lucide-react";
import { useState } from "react";

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
      sale_percentage: null,
      discount_end_datetime: null,
      stock: 0,
      low_stock_threshold: 0,
      is_active: true,
      category_id: "",
      brand_id: "",
    });
    setIsDiscountEnabled(false);
    setDate(undefined);
  };
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(false);

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
              <div className="border-2 border-dashed border-muted rounded-lg h-64 flex items-center justify-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upload Image</p>
                </div>
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
                    <Button variant="link" size="small">
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
                    <Button variant="link" size="small">
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
            </div>
          </div>

          {/* Price, Storage, Discount */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-stock">
                  Tồn kho<span className="text-red-700">*</span>
                </Label>
                <Input
                  id="new-stock"
                  type="number"
                  placeholder="Storage"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-stock">
                    Định mức tồn thấp nhất
                    <span className="text-red-700">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleQuestionMarkIcon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Khi tổn kho chạm đến định mức, bạn sẽ nhận được cảnh báo
                        từ hệ thống
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Input
                  id="new-low-stock-threshold"
                  type="number"
                  placeholder="Minimum stock level"
                  value={newProduct.low_stock_threshold}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, low_stock_threshold: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-price">
                  Giá (VND)<span className="text-red-700">*</span>
                </Label>
                <Input
                  id="new-price"
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                  }
                  step="1000"
                  className="max-w-68"
                />
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isDiscountEnabled}
                        onCheckedChange={(checked) => {
                          setIsDiscountEnabled(checked);
                          if (!checked) {
                            setNewProduct({
                              ...newProduct,
                              sale_percentage: null,
                              discount_end_datetime: null,
                            });
                          }
                        }}
                      />
                      <Label htmlFor="new-sale-percentage">Giảm giá (%)</Label>
                    </div>
                  </div>

                  <Input
                    id="new-sale-percentage"
                    type="number"
                    placeholder="Discount (%)"
                    min="0"
                    max="100"
                    value={newProduct.sale_percentage || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        sale_percentage: parseFloat(e.target.value) || null,
                      })
                    }
                    disabled={!isDiscountEnabled}
                    className="max-w-68"
                  />
                  {isDiscountEnabled && newProduct.sale_percentage ? (
                    <FieldDescription>
                      Giá sau giảm:{" "}
                      {(newProduct.price * (100 - newProduct.sale_percentage)) / 100}
                    </FieldDescription>
                  ) : null}
                </div>
                {isDiscountEnabled && (
                  <>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="discount-end-datetime">
                        Thời gian kết thúc khuyến mại
                      </Label>
                      <Input
                        type="datetime-local"
                        id="discount-end-datetime"
                        value={
                          newProduct.discount_end_datetime
                            ? new Date(new Date(newProduct.discount_end_datetime).getTime() - new Date(newProduct.discount_end_datetime).getTimezoneOffset() * 60000)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            discount_end_datetime: e.target.value ? new Date(e.target.value).toISOString() : null,
                          })
                        }
                        className="bg-background appearance-none"
                      />
                    </div>
                  </>
                )}
              </div>
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
    </Dialog>
  );
}
