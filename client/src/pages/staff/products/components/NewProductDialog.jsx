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
import { FieldError } from "@/components/ui/field";
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
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import NewBrandDialog from "./NewBrandDialog";
import NewCategoryDialog from "./NewCategoryDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { uploadProductImage } from "../services/productApi";

// Validation Schema
const productValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tên sản phẩm là bắt buộc")
    .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự"),

  price: Yup.number()
    .required("Giá sản phẩm là bắt buộc")
    .positive("Giá phải lớn hơn 0")
    .min(1000, "Giá tối thiểu là 1,000 VND")
    .max(100000000, "Giá không được vượt quá 100,000,000 VND"),

  category: Yup.string().required("Danh mục là bắt buộc"),

  brand: Yup.string().required("Thương hiệu là bắt buộc"),

  quantity: Yup.number()
    .required("Số lượng là bắt buộc")
    .integer("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm")
    .max(100000, "Số lượng không được vượt quá 100,000"),

  weight: Yup.number()
    .required("Trọng lượng là bắt buộc")
    .positive("Trọng lượng phải lớn hơn 0")
    .max(50000, "Trọng lượng không được vượt quá 50,000 gam"),

  manufacturer: Yup.string()
    .required("Nhà sản xuất là bắt buộc")
    .min(2, "Nhà sản xuất phải có ít nhất 2 ký tự")
    .max(200, "Nhà sản xuất không được vượt quá 200 ký tự"),

  imageUrl: Yup.string().required("Hình ảnh sản phẩm là bắt buộc"),

  description: Yup.string().max(2000, "Mô tả không được vượt quá 2000 ký tự"),

  appropriateAge: Yup.string().max(
    50,
    "Độ tuổi thích hợp không được vượt quá 50 ký tự",
  ),

  manufacture: Yup.string()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Ngày sản xuất phải có định dạng YYY-MM-DD\n(ví dụ: 2027-10-31)",
    )
    .max(50, "Ngày sản xuất không được vượt quá 50 ký tự"),

  expiry: Yup.string()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Hạn sử dụng phải có định dạng YYYY-MM-DD (ví dụ: 2027-10-31)",
    )
    .max(50, "Hạn sử dụng không được vượt quá 50 ký tự"),

  storageInstructions: Yup.string().max(
    1000,
    "Hướng dẫn bảo quản không được vượt quá 1000 ký tự",
  ),

  instructionsForUse: Yup.string().max(
    1000,
    "Hướng dẫn sử dụng không được vượt quá 1000 ký tự",
  ),

  warning: Yup.string().max(1000, "Cảnh báo không được vượt quá 1000 ký tự"),

  tags: Yup.string().max(200, "Tình trạng không được vượt quá 200 ký tự"),
});

export default function NewProductDialog({
  isOpen,
  onClose,
  categories,
  brands,
  onCreateProduct,
  onCreateBrand,
  onCreateCategory,
}) {
  const { token } = useAuth();
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", description: "" });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      brand: "",
      quantity: 0,
      imageUrl: "",
      manufacture: "",
      expiry: "",
      storageInstructions: "",
      instructionsForUse: "",
      warning: "",
      manufacturer: "",
      appropriateAge: "",
      weight: 0,
      tags: "",
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      await onCreateProduct(values);
      // Reset form after successful submission
      formik.resetForm();
      setImagePreview(null);
    },
  });

  const handleClose = () => {
    onClose();
    formik.resetForm();
    setImagePreview(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
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
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const response = await uploadProductImage(file, token);
        
        if (response?.data?.imageUrl) {
          formik.setFieldValue("imageUrl", response.data.imageUrl);
          toast.success("Tải ảnh lên thành công!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(error.message || "Không thể tải ảnh lên. Vui lòng thử lại.");
        setImagePreview(null);
        formik.setFieldValue("imageUrl", "");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Helper function to display error
  const getErrorMessage = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName] ? (
      <FieldError>{formik.errors[fieldName]}</FieldError>
    ) : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="min-w-6xl max-h-[90vh] overflow-y-auto"
        aria-describedby="new-product-form"
      >
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Top Section: Image Upload + Product Info */}
          <div className="grid grid-cols-[280px_1fr] gap-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>
                Hình ảnh sản phẩm<span className="text-red-700">*</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-3 bg-background ${
                  formik.touched.imageUrl && formik.errors.imageUrl
                    ? "border-red-500"
                    : "border-muted"
                }`}
              >
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
                    onBlur={() => formik.setFieldTouched("imageUrl", true)}
                    disabled={isUploadingImage}
                  />
                  <span className="block w-full text-center px-3 py-2 rounded-md border border-input text-sm font-medium cursor-pointer hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploadingImage ? "Đang tải lên..." : "Chọn ảnh"}
                  </span>
                </label>
                {imagePreview && (
                  <Button
                    variant="link"
                    size="small"
                    onClick={() => {
                      setImagePreview(null);
                      formik.setFieldValue("imageUrl", "");
                    }}
                    type="button"
                    className="cursor-pointer"
                  >
                    Xóa ảnh
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Dung lượng file tối đa 1MB
                  <br />
                  Định dạng .JPEG, .PNG
                </p>
                {getErrorMessage("imageUrl")}
              </div>
            </div>

            {/* Product Info */}
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="new-name">
                    Tên sản phẩm<span className="text-red-700">*</span>
                  </Label>
                  <Input
                    id="new-name"
                    name="name"
                    placeholder="Product name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {getErrorMessage("name")}
                </div>

                {/* Brand + Category + Appropriate Age */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Brand */}
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
                        className="cursor-pointer"
                      >
                        Tạo mới
                      </Button>
                    </div>
                    <Select
                      value={formik.values.brand || ""}
                      onValueChange={(value) =>
                        formik.setFieldValue("brand", value)
                      }
                    >
                      <SelectTrigger
                        id="new-brand"
                        className={`w-full ${formik.touched.brand && formik.errors.brand ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Chọn thương hiệu">
                          {formik.values.brand
                            ? brands?.find(
                                (b) =>
                                  b.id === formik.values.brand ||
                                  b._id === formik.values.brand,
                              )?.name
                            : "Chọn thương hiệu"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(brands ?? []).map((brand) => (
                            <SelectItem
                              key={brand.id || brand._id}
                              value={brand.id || brand._id}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("brand")}
                  </div>

                  {/* Category */}
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
                        className="cursor-pointer"
                      >
                        Tạo mới
                      </Button>
                    </div>
                    <Select
                      value={formik.values.category || ""}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                    >
                      <SelectTrigger
                        id="new-category"
                        className={`w-full ${formik.touched.category && formik.errors.category ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Chọn danh mục">
                          {formik.values.category
                            ? categories?.find(
                                (c) =>
                                  c.id === formik.values.category ||
                                  c._id === formik.values.category,
                              )?.name
                            : "Chọn danh mục"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(categories ?? []).map((cat) => (
                            <SelectItem
                              key={cat.id || cat._id}
                              value={cat.id || cat._id}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("category")}
                  </div>

                  {/* Appropriate Age */}
                  <div className="mt-1 space-y-2.5">
                    <Label htmlFor="new-appropriate-age">
                      Độ tuổi thích hợp
                    </Label>
                    <Input
                      id="new-appropriate-age"
                      name="appropriateAge"
                      type="text"
                      placeholder="Ví dụ: 0-6 tháng"
                      value={formik.values.appropriateAge || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.appropriateAge &&
                        formik.errors.appropriateAge
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("appropriateAge")}
                  </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 flex-1 max-w-64">
                    <Label htmlFor="new-price">
                      Giá (VND)<span className="text-red-700">*</span>
                    </Label>
                    <Input
                      id="new-price"
                      name="price"
                      type="number"
                      placeholder="Price"
                      value={formik.values.price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        formik.setFieldValue("price", value);
                      }}
                      onBlur={formik.handleBlur}
                      step="1000"
                      className={
                        formik.touched.price && formik.errors.price
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("price")}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tình trạng hàng</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="Nhập tags (ví dụ: hot, sale, new), phân cách bằng dấu phẩy"
                      value={formik.values.tags || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {getErrorMessage("tags")}
                  </div>
                </div>

                {/* Quantity, Weight, Manufacturer */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Quantity */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="new-quantity">
                      Số lượng<span className="text-red-700">*</span>
                    </Label>
                    <Input
                      id="new-quantity"
                      name="quantity"
                      type="number"
                      placeholder="Số lượng"
                      value={formik.values.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        formik.setFieldValue("quantity", value);
                      }}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.quantity && formik.errors.quantity
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("quantity")}
                  </div>

                  {/* Weight */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="new-weight">
                      Trọng lượng (gam)<span className="text-red-700">*</span>
                    </Label>
                    <Input
                      id="new-weight"
                      name="weight"
                      type="number"
                      placeholder="Trọng lượng"
                      value={formik.values.weight || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        formik.setFieldValue("weight", value);
                      }}
                      onBlur={formik.handleBlur}
                      step="1"
                      className={
                        formik.touched.weight && formik.errors.weight
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("weight")}
                  </div>

                  {/* Manufacturer */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="new-manufacturer">
                      Nhà sản xuất<span className="text-red-700">*</span>
                    </Label>
                    <Input
                      id="new-manufacturer"
                      name="manufacturer"
                      type="text"
                      placeholder="Nhà sản xuất"
                      value={formik.values.manufacturer || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.manufacturer &&
                        formik.errors.manufacturer
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("manufacturer")}
                  </div>
                </div>

                {/* Manufacture & Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Manufacture */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="manufacture">Ngày sản xuất</Label>
                    <Input
                      id="manufacture"
                      name="manufacture"
                      type="text"
                      placeholder="Ví dụ: 2027-10-01"
                      value={formik.values.manufacture || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.manufacture && formik.errors.manufacture
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("manufacture")}
                  </div>

                  {/* Expiry */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="expiry">Hạn sử dụng</Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      type="text"
                      placeholder="Ví dụ: 2027-10-01"
                      value={formik.values.expiry || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.expiry && formik.errors.expiry
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("expiry")}
                  </div>
                </div>

                {/* Description & Storage Instructions */}
                <div className="flex gap-4">
                  {/* Description */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="description">Mô tả sản phẩm</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Mô tả chi tiết về sản phẩm"
                      value={formik.values.description || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`min-h-20 max-w-full resize-y max-h-[30vh] ${formik.touched.description && formik.errors.description ? "border-red-500" : ""}`}
                      rows={3}
                    />
                    {getErrorMessage("description")}
                  </div>

                  {/* Storage Instructions */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="storage">Hướng dẫn bảo quản</Label>
                    <Textarea
                      id="storage"
                      name="storageInstructions"
                      placeholder="Cách bảo quản sản phẩm"
                      value={formik.values.storageInstructions || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`min-h-20 max-w-full resize-y max-h-[30vh] ${formik.touched.storageInstructions && formik.errors.storageInstructions ? "border-red-500" : ""}`}
                      rows={3}
                    />
                    {getErrorMessage("storageInstructions")}
                  </div>
                </div>

                {/* Instructions & Warning */}
                <div className="flex gap-4">
                  {/* Instructions For Use */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="instructions">Hướng dẫn sử dụng</Label>
                    <Textarea
                      id="instructions"
                      name="instructionsForUse"
                      placeholder="Hướng dẫn cách sử dụng sản phẩm"
                      value={formik.values.instructionsForUse || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`min-h-20 max-w-full resize-y max-h-[30vh] ${formik.touched.instructionsForUse && formik.errors.instructionsForUse ? "border-red-500" : ""}`}
                      rows={3}
                    />
                    {getErrorMessage("instructionsForUse")}
                  </div>

                  {/* Warning */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="warning">Cảnh báo</Label>
                    <Textarea
                      id="warning"
                      name="warning"
                      placeholder="Các lưu ý và cảnh báo khi sử dụng"
                      value={formik.values.warning || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`min-h-20 max-w-full resize-y max-h-[30vh] ${formik.touched.warning && formik.errors.warning ? "border-red-500" : ""}`}
                      rows={3}
                    />
                    {getErrorMessage("warning")}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="items-center sm:justify-between">
          <div>
            <span className="text-red-700">*</span> Trường bắt buộc
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose} type="button">
              Hủy
            </Button>
            <Button
              onClick={formik.handleSubmit}
              disabled={!formik.isValid || formik.isSubmitting}
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
        onCreateBrand={async () => {
          const result = await onCreateBrand(newBrand);
          if (result.success) {
            setIsBrandDialogOpen(false);
            setNewBrand({ name: "", description: "" });
            // Set the newly created brand as selected
            if (result.brand) {
              const brandId = result.brand._id || result.brand.id;
              formik.setFieldValue("brand", brandId);
            }
          } else {
            // Error already shown by parent handler via toast
            console.error("Failed to create brand:", result.error);
          }
        }}
      />

      <NewCategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onCreateCategory={async () => {
          const result = await onCreateCategory(newCategory);
          if (result.success) {
            setIsCategoryDialogOpen(false);
            setNewCategory({ name: "", description: "" });
            // Set the newly created category as selected
            if (result.category) {
              const categoryId = result.category._id || result.category.id;
              formik.setFieldValue("category", categoryId);
            }
          } else {
            // Error already shown by parent handler via toast
            console.error("Failed to create category:", result.error);
          }
        }}
      />
    </Dialog>
  );
}
