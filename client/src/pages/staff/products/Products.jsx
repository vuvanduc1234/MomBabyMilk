import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewProductDialog from "./components/NewProductDialog";
import EditProductDialog from "./components/EditProductDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetchProducts = async () => {
  try {
    const response = await axiosInstance.get("/api/product");
    // Map API response to component's expected format
    const productsArray = response.data.data || response.data;
    const mappedProducts = productsArray.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity || 0,
      imageUrl: product.imageUrl || "",
      category_id: product.category?._id || product.category || null,
      brand_id: product.brand?._id || product.brand || null,
      category: product.category || null,
      brand: product.brand || null,
      // Additional fields from API
      appropriateAge: product.appropriateAge,
      expiry: product.expiry,
      instructionsForUse: product.instructionsForUse,
      manufacture: product.manufacture,
      manufacturer: product.manufacturer,
      storageInstructions: product.storageInstructions,
      warning: product.warning,
      weight: product.weight,
      tags: product.tags,
    }));

    return mappedProducts;
  } catch (error) {
    console.error("[fetchProducts] Error fetching products:", error);
    throw error;
  }
};

// Format price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function StaffProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products, brands, and categories from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, brandsData, categoriesData] = await Promise.all([
          fetchProducts(),
          axiosInstance.get("/api/brand").then((res) => res.data.data),
          axiosInstance.get("/api/category").then((res) => res.data.data),
        ]);
        setProducts(productsData);
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
        console.error("[Products] Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pageSize = 10;

  // Filter and paginate products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === categoryFilter,
      );
    }

    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter((product) => product.brand_id === brandFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.quantity <= 5);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((product) => product.quantity === 0);
    } else if (stockFilter === "in") {
      filtered = filtered.filter((product) => product.quantity > 5);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(minPrice),
      );
    }
    if (maxPrice) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(maxPrice),
      );
    }

    // Active status filter (skip for now as API doesn't have is_active field)
    // if (activeFilter === "active") {
    //   filtered = filtered.filter((product) => product.is_active);
    // } else if (activeFilter === "inactive") {
    //   filtered = filtered.filter((product) => !product.is_active);
    // }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description &&
            product.description.toLowerCase().includes(searchLower)),
      );
    }

    return filtered;
  }, [
    products,
    categoryFilter,
    brandFilter,
    stockFilter,
    minPrice,
    maxPrice,
    search,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page]);

  const updateProduct = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
    setEditProduct(null);
  };

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleCreateBrand = async (brandData) => {
    try {
      const response = await axiosInstance.post("/api/brand", brandData);

      // Add the new brand to the brands list
      const newBrand = response.data.data || response.data;
      setBrands([...brands, newBrand]);
      toast.success(`Thương hiệu "${newBrand.name}" đã được tạo thành công!`);

      return { success: true, brand: newBrand };
    } catch (error) {
      console.error("[handleCreateBrand] Error creating brand:", error);
      console.error(
        "[handleCreateBrand] Error details:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo thương hiệu";
      toast.error(`Lỗi: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await axiosInstance.post("/api/category", categoryData);

      // Add the new category to the categories list
      const newCategory = response.data.data || response.data;
      setCategories([...categories, newCategory]);
      toast.success(`Danh mục "${newCategory.name}" đã được tạo thành công!`);

      return { success: true, category: newCategory };
    } catch (error) {
      console.error("[handleCreateCategory] Error creating category:", error);
      console.error(
        "[handleCreateCategory] Error details:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo danh mục";
      toast.error(`Lỗi: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  const handleCreateProduct = async (productValues) => {
    try {
      // Prepare JSON payload (backend expects JSON, not FormData)
      const productData = {
        name: productValues.name,
        price: productValues.price,
        category: productValues.category,
        brand: productValues.brand,
        quantity: productValues.quantity,
        imageUrl: productValues.imageUrl,
      };

      // Add optional fields only if they have values
      if (productValues.description && productValues.description.trim()) {
        productData.description = productValues.description;
      }
      if (productValues.weight && productValues.weight > 0) {
        productData.weight = productValues.weight;
      }
      if (productValues.manufacturer && productValues.manufacturer.trim()) {
        productData.manufacturer = productValues.manufacturer;
      }
      if (productValues.appropriateAge && productValues.appropriateAge.trim()) {
        productData.appropriateAge = productValues.appropriateAge;
      }
      if (productValues.manufacture && productValues.manufacture.trim()) {
        productData.manufacture = productValues.manufacture;
      }
      if (productValues.expiry && productValues.expiry.trim()) {
        productData.expiry = productValues.expiry;
      }
      if (
        productValues.storageInstructions &&
        productValues.storageInstructions.trim()
      ) {
        productData.storageInstructions = productValues.storageInstructions;
      }
      if (
        productValues.instructionsForUse &&
        productValues.instructionsForUse.trim()
      ) {
        productData.instructionsForUse = productValues.instructionsForUse;
      }
      if (productValues.warning && productValues.warning.trim()) {
        productData.warning = productValues.warning;
      }
      if (productValues.tags && productValues.tags.trim()) {
        productData.tags = productValues.tags;
      }

      const response = await axiosInstance.post("/api/product", productData);

      // Add the new product to the products list
      const newProductData = response.data.data || response.data;

      // Fetch the complete product details (to get populated category and brand)
      const productResponse = await axiosInstance.get(
        `/api/product/${newProductData._id}`,
      );

      const completeProduct = productResponse.data.data || productResponse.data;

      // Map to component format
      const mappedProduct = {
        id: completeProduct._id,
        name: completeProduct.name,
        description: completeProduct.description || "",
        price: completeProduct.price,
        quantity: completeProduct.quantity || 0,
        imageUrl: completeProduct.imageUrl || "",
        category_id:
          completeProduct.category?._id || completeProduct.category || null,
        brand_id: completeProduct.brand?._id || completeProduct.brand || null,
        category: completeProduct.category || null,
        brand: completeProduct.brand || null,
        appropriateAge: completeProduct.appropriateAge,
        expiry: completeProduct.expiry,
        instructionsForUse: completeProduct.instructionsForUse,
        manufacture: completeProduct.manufacture,
        manufacturer: completeProduct.manufacturer,
        storageInstructions: completeProduct.storageInstructions,
        warning: completeProduct.warning,
        weight: completeProduct.weight,
        tags: completeProduct.tags,
      };

      setProducts([...products, mappedProduct]);
      setIsCreateDialogOpen(false);

      toast.success(`Sản phẩm "${productValues.name}" đã được tạo thành công!`);
    } catch (error) {
      console.error("[handleCreateProduct] Error creating product:", error);
      console.error(
        "[handleCreateProduct] Error details:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo sản phẩm";
      toast.error(`Lỗi: ${errorMsg}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await axiosInstance.delete(`/api/product/${productId}`);

        // Remove the product from the products list
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success("Đã xóa sản phẩm thành công!");
      } catch (error) {
        console.error("[handleDeleteProduct] Error deleting product:", error);
        console.error(
          "[handleDeleteProduct] Error details:",
          error.response?.data || error.message,
        );
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Không thể xóa sản phẩm";
        toast.error(`Lỗi: ${errorMsg}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để xóa");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`,
      )
    ) {
      return;
    }

    try {
      // Delete each product individually using the DELETE endpoint
      const deletePromises = selectedProducts.map((_id) =>
        axiosInstance.delete(`/api/product/${_id}`),
      );

      await Promise.all(deletePromises);

      // Remove deleted products from state
      setProducts((prev) =>
        prev.filter((p) => !selectedProducts.includes(p.id)),
      );

      const deletedCount = selectedProducts.length;
      setSelectedProducts([]);

      toast.success(`Đã xóa ${deletedCount} sản phẩm thành công!`);
    } catch (error) {
      console.error("[handleBulkDelete] Error deleting products:", error);
      console.error(
        "[handleBulkDelete] Error details:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa sản phẩm";
      toast.error(`Lỗi: ${errorMsg}`);
    }
  };

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProducts.includes(p.id));
  const isSomeSelected =
    paginatedProducts.some((p) => selectedProducts.includes(p.id)) &&
    !isAllSelected;

  return (
    <>
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="pt-2 pb-6">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Quản lý sản phẩm
            </h1>
          </div>
          <div className="sticky top-20 bg-white border rounded-lg shadow-sm p-4 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div>
              <h3 className="font-semibold text-sm mb-3">Bộ lọc</h3>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Danh mục</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Thương hiệu</Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {(brands ?? []).map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Stock Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tình trạng kho</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="in">Còn hàng (&gt;5)</SelectItem>
                    <SelectItem value="low">Sắp hết (≤5)</SelectItem>
                    <SelectItem value="out">Hết hàng (0)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trạng thái</Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hiển thị</SelectItem>
                    <SelectItem value="inactive">Đã ẩn</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Khoảng giá</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Giá tối đa"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCategoryFilter("all");
                  setBrandFilter("all");
                  setStockFilter("all");
                  setActiveFilter("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setSearch("");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="pt-2 flex-1 space-y-5">
          {/* Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo sản phẩm mới
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">Lỗi tải dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Products Table */}
          <Card className="py-2 max-h-[calc(100vh-10rem)]">
            <CardContent className="px-3">
              {isLoading ? (
                <div className="space-y-0">
                  {/* Pagination skeleton */}
                  <div className="flex items-center justify-end gap-4 px-2 pt-1 pb-3 border-b">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  {/* Table skeleton */}
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-8">
                          <Skeleton className="h-4 w-4" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-32" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-10">
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="text-right">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <TableRow key={i} className="hover:bg-transparent">
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-16" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-8" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-10" />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      {selectedProducts.length > 0 && (
                        <>
                          <p className="">Đã chọn {selectedProducts.length}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa đã chọn
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page >= totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="w-full h-[calc(100vh-14rem)]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-20 ">
                        <TableRow className="hover:bg-white">
                          <TableHead className="w-8 bg-white">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all products"
                              className={isSomeSelected ? "opacity-50" : ""}
                              title="Chọn tất cả sản phẩm"
                            />
                          </TableHead>
                          <TableHead className="bg-white">Mã hàng</TableHead>
                          <TableHead className="bg-white">Sản phẩm</TableHead>
                          <TableHead className="bg-white">Danh mục</TableHead>
                          <TableHead className="bg-white">Giá bán</TableHead>
                          <TableHead className="bg-white">Độ tuổi</TableHead>
                          <TableHead className="bg-white">Khối lượng</TableHead>
                          <TableHead className="bg-white">Tồn kho</TableHead>
                          <TableHead className="text-right bg-white"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product) => (
                          <TableRow key={product.id} className="group">
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectProduct(product.id, checked)
                                }
                                aria-label={`Select ${product.name}`}
                              />
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {product.id.slice(-6).toUpperCase()}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    (Array.isArray(product.imageUrl)
                                      ? product.imageUrl[0]
                                      : product.imageUrl) || "/placeholder.svg"
                                  }
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <div>
                                  <p className="font-medium line-clamp-1">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.brand?.name || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {product.category?.name || "N/A"}
                              </code>
                            </TableCell>
                            <TableCell>
                              <p>{formatPrice(product.price)}</p>
                            </TableCell>
                            <TableCell>
                              <p className="truncate max-w-37.5">
                                {product.appropriateAge || "-"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {product.weight ? `${product.weight}g` : "-"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.quantity <= 5
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {product.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditProduct({ ...product })}
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xóa sản phẩm"
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Product Dialog */}
      {editProduct && (
        <EditProductDialog
          isOpen={true}
          onClose={() => setEditProduct(null)}
          product={editProduct}
          categories={categories}
          brands={brands}
          onUpdateProduct={updateProduct}
          onCreateBrand={handleCreateBrand}
          onCreateCategory={handleCreateCategory}
          token={token}
        />
      )}

      {/* Create Product Dialog */}
      <NewProductDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        categories={categories}
        brands={brands}
        onCreateProduct={handleCreateProduct}
        onCreateBrand={handleCreateBrand}
        onCreateCategory={handleCreateCategory}
      />
    </>
  );
}
