import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  MoreHorizontal,
} from "lucide-react";
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

// Mock data
const mockCategories = [
  { id: "1", name: "Sữa bột" },
  { id: "2", name: "Sữa nước" },
  { id: "3", name: "Dinh dưỡng" },
  { id: "4", name: "Phụ kiện" },
];

const mockBrands = [
  { id: "1", name: "Similac" },
  { id: "2", name: "Enfamil" },
  { id: "3", name: "Abbott" },
  { id: "4", name: "Aptamil" },
  { id: "5", name: "Meiji" },
];

const mockProducts = [
  {
    id: "1",
    product_code: "SML-001",
    name: "Similac Gain Plus 900g",
    short_description: "Sữa bột dành cho trẻ từ 1-3 tuổi",
    price: 680000,
    sale_percentage: 8,
    discount_end_datetime: "2026-02-28T23:59:59.000Z",
    stock: 45,
    low_stock_threshold: 10,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "1",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "1", name: "Similac" },
  },
  {
    id: "2",
    product_code: "ENF-002",
    name: "Enfamil A+ 400g",
    short_description: "Sữa công thức cho trẻ sơ sinh",
    price: 450000,
    sale_percentage: null,
    discount_end_datetime: null,
    stock: 5,
    low_stock_threshold: 5,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "2",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "2", name: "Enfamil" },
  },
  {
    id: "3",
    product_code: "ABT-003",
    name: "Abbott Grow Gold 1.7kg",
    short_description: "Sữa bột dinh dưỡng cho trẻ 3-6 tuổi",
    price: 850000,
    sale_percentage: 6,
    discount_end_datetime: "2026-03-15T23:59:59.000Z",
    stock: 28,
    low_stock_threshold: 15,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "3",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "3", name: "Abbott" },
  },
  {
    id: "4",
    product_code: "APT-004",
    name: "Aptamil Essensis 800g",
    short_description: "Sữa công thức cao cấp từ Đức",
    price: 520000,
    sale_percentage: 10,
    discount_end_datetime: "2026-02-14T23:59:59.000Z",
    stock: 4,
    low_stock_threshold: 8,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "4",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "4", name: "Aptamil" },
  },
  {
    id: "5",
    product_code: "MEI-005",
    name: "Meiji Infant Formula 800g",
    short_description: "Sữa công thức Nhật Bản cho trẻ 0-12 tháng",
    price: 680000,
    sale_percentage: 5,
    discount_end_datetime: "2026-02-20T23:59:59.000Z",
    stock: 18,
    low_stock_threshold: 12,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "5",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "5", name: "Meiji" },
  },
  {
    id: "6",
    product_code: "SML-006",
    name: "Similac Ready-to-Feed 180ml",
    short_description: "Sữa nước tiện lợi, không cầnpha",
    price: 35000,
    sale_percentage: null,
    discount_end_datetime: null,
    stock: 120,
    low_stock_threshold: 30,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "2",
    brand_id: "1",
    category: { id: "2", name: "Sữa nước" },
    brand: { id: "1", name: "Similac" },
  },
  {
    id: "7",
    product_code: "ENF-007",
    name: "Enfamil A+ Liquid 946ml",
    short_description: "Sữa nước công thức dạng lỏng",
    price: 185000,
    sale_percentage: 5,
    discount_end_datetime: "2026-02-10T23:59:59.000Z",
    stock: 35,
    low_stock_threshold: 20,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "2",
    brand_id: "2",
    category: { id: "2", name: "Sữa nước" },
    brand: { id: "2", name: "Enfamil" },
  },
  {
    id: "8",
    product_code: "ABT-008",
    name: "Abbott PediaSure Vanilla 900g",
    short_description: "Dinh dưỡng y học cho trẻ biếng ăn",
    price: 590000,
    sale_percentage: 7,
    discount_end_datetime: "2026-03-01T23:59:59.000Z",
    stock: 12,
    low_stock_threshold: 10,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "3",
    brand_id: "3",
    category: { id: "3", name: "Dinh dưỡng" },
    brand: { id: "3", name: "Abbott" },
  },
  {
    id: "9",
    product_code: "MEI-009",
    name: "Meiji Growing Up 1-3 Years 800g",
    short_description: "Sữa bột cho trẻ đang lớn",
    price: 580000,
    sale_percentage: null,
    discount_end_datetime: null,
    stock: 22,
    low_stock_threshold: 15,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "5",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "5", name: "Meiji" },
  },
  {
    id: "10",
    product_code: "APT-010",
    name: "Aptamil Gold+ Stage 1",
    short_description: "Sữa công thức cho trẻ 0-6 tháng",
    price: 490000,
    sale_percentage: 6,
    discount_end_datetime: "2026-02-25T23:59:59.000Z",
    stock: 8,
    low_stock_threshold: 10,
    is_active: false,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "4",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "4", name: "Aptamil" },
  },
  {
    id: "11",
    product_code: "APT-010",
    name: "Aptamil Gold+ Stage 1",
    short_description: "Sữa công thức cho trẻ 0-6 tháng",
    price: 490000,
    sale_percentage: 6,
    discount_end_datetime: "2026-02-25T23:59:59.000Z",
    stock: 8,
    low_stock_threshold: 10,
    is_active: false,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "4",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "4", name: "Aptamil" },
  },
  {
    id: "12",
    product_code: "APT-010",
    name: "Aptamil Gold+ Stage 1",
    short_description: "Sữa công thức cho trẻ 0-6 tháng",
    price: 490000,
    sale_percentage: 6,
    discount_end_datetime: "2026-02-25T23:59:59.000Z",
    stock: 8,
    low_stock_threshold: 10,
    is_active: false,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "4",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "4", name: "Aptamil" },
  },
];

// Format price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function StaffProducts() {
  const [products, setProducts] = useState(mockProducts);
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

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  const [newProduct, setNewProduct] = useState({
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
  const pageSize = 10;

  const categories = mockCategories;
  const brands = mockBrands;

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
      filtered = filtered.filter((product) => product.stock <= 5);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((product) => product.stock === 0);
    } else if (stockFilter === "in") {
      filtered = filtered.filter((product) => product.stock > 5);
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

    // Active status filter
    if (activeFilter === "active") {
      filtered = filtered.filter((product) => product.is_active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((product) => !product.is_active);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.product_code.toLowerCase().includes(searchLower),
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
    activeFilter,
    search,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page]);

  const updateProduct = (updates) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updates.id ? { ...product, ...updates } : product,
      ),
    );
    setEditProduct(null);
    console.log("Đã cập nhật sản phẩm");
  };

  const toggleActive = (id, is_active) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, is_active } : product,
      ),
    );
    console.log("Đã cập nhật trạng thái");
  };

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const handleSaveProduct = () => {
    if (!editProduct) return;
    updateProduct({
      id: editProduct.id,
      name: editProduct.name,
      short_description: editProduct.short_description,
      stock: editProduct.stock,
    });
  };

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

  const handleCreateProduct = () => {
    const productToCreate = {
      ...newProduct,
      id: String(products.length + 1),
      category: categories.find((c) => c.id === newProduct.category_id),
      brand: brands.find((b) => b.id === newProduct.brand_id),
      image_url: "/placeholder.jpg",
      price: parseFloat(newProduct.price) || 0,
      sale_percentage: newProduct.sale_percentage
        ? parseFloat(newProduct.sale_percentage)
        : null,
      discount_end_datetime: newProduct.discount_end_datetime,
      stock: parseInt(newProduct.stock) || 0,
      low_stock_threshold: parseInt(newProduct.low_stock_threshold) || 0,
    };

    // setProducts([...products, productToCreate]);
    setIsCreateDialogOpen(false);
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
    console.log("Đã tạo sản phẩm mới: ", productToCreate);
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
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
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
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
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
                  <div className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8"><Skeleton className="h-4 w-4" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                          <TableHead className="w-10"><Skeleton className="h-4 w-16" /></TableHead>
                          <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array(8)
                          .fill(0)
                          .map((_, i) => (
                            <TableRow key={i} className="hover:bg-transparent">
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Skeleton className="h-12 w-12 rounded" />
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-10" /></TableCell>
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
                </div>
              ) : (
                <>
                  {/* Pagination */}
                  <div className="flex items-center justify-end gap-4 px-2 pt-1 pb-3 border-b">
                    <p className="text-sm text-muted-foreground">
                      Trang {page} / {totalPages} ({filteredProducts.length} sản
                      phẩm)
                    </p>
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
                          <TableHead className="bg-white">Khuyến mại</TableHead>
                          <TableHead className="bg-white">Giá vốn</TableHead>
                          <TableHead className="bg-white">Tồn kho</TableHead>
                          <TableHead className="w-10 bg-white">
                            Hiển thị
                          </TableHead>
                          <TableHead className="text-right bg-white">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product) => (
                          <TableRow key={product.id}>
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
                                {product.product_code}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image_url || "/placeholder.svg"}
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
                                {product.category?.name +
                                  "/" +
                                  product.brand.name || "N/A"}
                              </code>
                            </TableCell>
                            <TableCell>
                              <p>{formatPrice(product.price)}</p>
                            </TableCell>
                            <TableCell>
                              <p className="">
                                {product.sale_percentage
                                  ? formatPrice(
                                      product.price * (100 - product.sale_percentage) / 100,
                                    )
                                  : "-"}
                              </p>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.stock <= 5 ? "destructive" : "outline"
                                }
                              >
                                {product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={product.is_active}
                                onCheckedChange={(checked) =>
                                  toggleActive(product.id, checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
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
                                title="Xem chi tiết"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
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
        <Dialog open={true} onOpenChange={() => setEditProduct(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={editProduct.image_url || "/placeholder.svg"}
                  alt={editProduct.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {editProduct.brand?.name || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {editProduct.category?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm</Label>
                <Input
                  id="name"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  value={editProduct.short_description || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      short_description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Số lượng tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Lưu ý:</strong> Staff không thể thay đổi giá sản phẩm
                  hoặc xóa sản phẩm vĩnh viễn. Liên hệ Admin nếu cần thay đổi
                  giá.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProduct(null)}>
                Hủy
              </Button>
              <Button onClick={handleSaveProduct}>Lưu thay đổi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Product Dialog */}
      <NewProductDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        brands={brands}
        onCreateProduct={handleCreateProduct}
      />
    </>
  );
}
