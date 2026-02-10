import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import NewBrandDialog from "./NewBrandDialog";
import NewCategoryDialog from "./NewCategoryDialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  description: Yup.string().max(2000, "Mô tả không được vượt quá 2000 ký tự"),

  appropriateAge: Yup.string().max(
    50,
    "Độ tuổi thích hợp không được vượt quá 50 ký tự",
  ),

  manufacture: Yup.string()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Ngày sản xuất phải có định dạng YYYY-MM-DD (ví dụ: 2027-10-31)",
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
});

export default function EditProductDialog({
  isOpen,
  onClose,
  product,
  categories,
  brands,
  onUpdateProduct,
  onCreateBrand,
  onCreateCategory,
  token,
}) {
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", description: "" });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: product?.name || "",
      price: product?.price || 0,
      description: product?.description || "",
      category: product?.category_id || "",
      brand: product?.brand_id || "",
      quantity: product?.quantity || 0,
      imageUrl: "",
      manufacture: product?.manufacture || "",
      expiry: product?.expiry || "",
      storageInstructions: product?.storageInstructions || "",
      instructionsForUse: product?.instructionsForUse || "",
      warning: product?.warning || "",
      manufacturer: product?.manufacturer || "",
      appropriateAge: product?.appropriateAge || "",
      weight: product?.weight || 0,
    },
    enableReinitialize: true,
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      console.log("[EditProductDialog] Submitting form with values:", values);
      await handleUpdateProduct(values);
    },
  });

  // Set image preview from existing product
  useEffect(() => {
    if (product?.imageUrl && Array.isArray(product.imageUrl) && product.imageUrl[0]) {
      setImagePreview(product.imageUrl[0]);
    }
  }, [product]);

  const handleClose = () => {
    if (
      formik.dirty &&
      !confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?")
    ) {
      return;
    }
    formik.resetForm();
    setImagePreview(null);
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        formik.setFieldValue("imageUrl", base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to display error
  const getErrorMessage = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : null;
  };

  const handleUpdateProduct = async (values) => {
    console.log("[EditProductDialog] Updating product:", product.id, values);
    try {
      // Prepare update payload
      const updateData = {
        name: values.name,
        price: values.price,
        category: values.category,
        brand: values.brand,
        quantity: values.quantity,
      };

      // Only include imageUrl if a new image was uploaded
      if (values.imageUrl && values.imageUrl !== product.imageUrl?.[0]) {
        updateData.imageUrl = [values.imageUrl];
      }

      // Add optional fields only if they have values
      if (values.description && values.description.trim()) {
        updateData.description = values.description;
      }
      if (values.weight && values.weight > 0) {
        updateData.weight = values.weight;
      }
      if (values.manufacturer && values.manufacturer.trim()) {
        updateData.manufacturer = values.manufacturer;
      }
      if (values.appropriateAge && values.appropriateAge.trim()) {
        updateData.appropriateAge = values.appropriateAge;
      }
      if (values.manufacture && values.manufacture.trim()) {
        updateData.manufacture = values.manufacture;
      }
      if (values.expiry && values.expiry.trim()) {
        updateData.expiry = values.expiry;
      }
      if (values.storageInstructions && values.storageInstructions.trim()) {
        updateData.storageInstructions = values.storageInstructions;
      }
      if (values.instructionsForUse && values.instructionsForUse.trim()) {
        updateData.instructionsForUse = values.instructionsForUse;
      }
      if (values.warning && values.warning.trim()) {
        updateData.warning = values.warning;
      }

      const response = await axios.patch(
        `${API_URL}/api/product/${product.id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      console.log("[EditProductDialog] Product updated:", response.data);

      // Fetch the complete updated product details
      const productResponse = await axios.get(
        `${API_URL}/api/product/${product.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const updatedProduct = productResponse.data.data || productResponse.data;

      // Map to component format
      const mappedProduct = {
        id: updatedProduct._id,
        name: updatedProduct.name,
        description: updatedProduct.description || "",
        price: updatedProduct.price,
        quantity: updatedProduct.quantity || 0,
        imageUrl: updatedProduct.imageUrl || [],
        category_id:
          updatedProduct.category?._id || updatedProduct.category || null,
        brand_id: updatedProduct.brand?._id || updatedProduct.brand || null,
        category: updatedProduct.category || null,
        brand: updatedProduct.brand || null,
        appropriateAge: updatedProduct.appropriateAge,
        expiry: updatedProduct.expiry,
        instructionsForUse: updatedProduct.instructionsForUse,
        manufacture: updatedProduct.manufacture,
        manufacturer: updatedProduct.manufacturer,
        storageInstructions: updatedProduct.storageInstructions,
        warning: updatedProduct.warning,
        weight: updatedProduct.weight,
      };

      onUpdateProduct(mappedProduct);
      toast.success(`Sản phẩm "${values.name}" đã được cập nhật thành công!`);
      formik.resetForm();
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error("[EditProductDialog] Error updating product:", error);
      console.error(
        "[EditProductDialog] Error details:",
        error.response?.data || error.message
      );
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật sản phẩm";
      toast.error(`Lỗi: ${errorMsg}`);
    }
  };

  const handleCreateNewBrand = async () => {
    if (!newBrand.name.trim()) {
      toast.error("Tên thương hiệu không được để trống");
      return;
    }

    const result = await onCreateBrand(newBrand);
    if (result.success) {
      formik.setFieldValue("brand", result.brand._id || result.brand.id);
      setNewBrand({ name: "", description: "" });
      setIsBrandDialogOpen(false);
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Tên danh mục không được để trống");
      return;
    }

    const result = await onCreateCategory(newCategory);
    if (result.success) {
      formik.setFieldValue("category", result.category._id || result.category.id);
      setNewCategory({ name: "", description: "" });
      setIsCategoryDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="min-w-6xl max-h-[90vh] overflow-y-auto"
          aria-describedby="edit-product-form"
        >
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Top Section: Image Upload + Product Info */}
            <div className="grid grid-cols-[280px_1fr] gap-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>
                  Hình ảnh sản phẩm
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-3 bg-background border-muted">
                  <div className="w-full aspect-square rounded-lg border-2 border-muted bg-muted/10 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
                      Chọn ảnh mới
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
                    Dung lượng file tối đa 5MB
                    <br />
                    Định dạng .JPEG, .PNG
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên sản phẩm<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
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
                  {getErrorMessage("name") && (
                    <p className="text-sm text-red-500">
                      {getErrorMessage("name")}
                    </p>
                  )}
                </div>

                {/* Brand + Category + Appropriate Age */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Brand */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brand">
                        Thương hiệu<span className="text-red-500">*</span>
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
                      value={formik.values.brand}
                      onValueChange={(value) =>
                        formik.setFieldValue("brand", value)
                      }
                    >
                      <SelectTrigger
                        id="brand"
                        className={`w-full ${formik.touched.brand && formik.errors.brand ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(brands ?? []).map((brand) => (
                            <SelectItem
                              key={brand._id || brand.id}
                              value={brand._id || brand.id}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("brand") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("brand")}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category">
                        Danh mục<span className="text-red-500">*</span>
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
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                    >
                      <SelectTrigger
                        id="category"
                        className={`w-full ${formik.touched.category && formik.errors.category ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(categories ?? []).map((cat) => (
                            <SelectItem
                              key={cat._id || cat.id}
                              value={cat._id || cat.id}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("category") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("category")}
                      </p>
                    )}
                  </div>

                  {/* Appropriate Age */}
                  <div className="mt-1 space-y-2.5">
                    <Label htmlFor="appropriateAge">Độ tuổi thích hợp</Label>
                    <Input
                      id="appropriateAge"
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
                    {getErrorMessage("appropriateAge") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("appropriateAge")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1 max-w-64">
                    <Label htmlFor="price">
                      Giá (VND)<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="Price"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      step="1000"
                      className={
                        formik.touched.price && formik.errors.price
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("price") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("price")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity, Weight, Manufacturer */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Quantity */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="quantity">
                      Số lượng<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="Số lượng"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.quantity && formik.errors.quantity
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("quantity") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("quantity")}
                      </p>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="weight">
                      Trọng lượng (gam)<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      placeholder="Trọng lượng"
                      value={formik.values.weight || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      step="1"
                      className={
                        formik.touched.weight && formik.errors.weight
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("weight") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("weight")}
                      </p>
                    )}
                  </div>

                  {/* Manufacturer */}
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="manufacturer">
                      Nhà sản xuất<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      type="text"
                      placeholder="Nhà sản xuất"
                      value={formik.values.manufacturer || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.manufacturer && formik.errors.manufacturer
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getErrorMessage("manufacturer") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("manufacturer")}
                      </p>
                    )}
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
                    {getErrorMessage("manufacture") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("manufacture")}
                      </p>
                    )}
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
                    {getErrorMessage("expiry") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("expiry")}
                      </p>
                    )}
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
                    {getErrorMessage("description") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("description")}
                      </p>
                    )}
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
                    {getErrorMessage("storageInstructions") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("storageInstructions")}
                      </p>
                    )}
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
                    {getErrorMessage("instructionsForUse") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("instructionsForUse")}
                      </p>
                    )}
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
                    {getErrorMessage("warning") && (
                      <p className="text-sm text-red-500">
                        {getErrorMessage("warning")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="items-center sm:justify-between">
            <div>
              <span className="text-red-500">*</span> Trường bắt buộc
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleClose} type="button">
                Hủy
              </Button>
              <Button
                onClick={formik.handleSubmit}
                disabled={!formik.isValid || formik.isSubmitting}
              >
                {formik.isSubmitting ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            console.error("Failed to create category:", result.error);
          }
        }}
      />
    </>
  );
}
