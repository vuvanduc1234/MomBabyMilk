import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Package,
} from "lucide-react";
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
    name: "Similac Gain Plus 900g",
    short_description: "Sữa bột dành cho trẻ từ 1-3 tuổi",
    price: 680000,
    sale_price: 625000,
    stock: 45,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "1",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "1", name: "Similac" },
  },
  {
    id: "2",
    name: "Enfamil A+ 400g",
    short_description: "Sữa công thức cho trẻ sơ sinh",
    price: 450000,
    sale_price: null,
    stock: 5,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "2",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "2", name: "Enfamil" },
  },
  {
    id: "3",
    name: "Abbott Grow Gold 1.7kg",
    short_description: "Sữa bột dinh dưỡng cho trẻ 3-6 tuổi",
    price: 850000,
    sale_price: 799000,
    stock: 28,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "3",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "3", name: "Abbott" },
  },
  {
    id: "4",
    name: "Aptamil Essensis 800g",
    short_description: "Sữa công thức cao cấp từ Đức",
    price: 520000,
    sale_price: 470000,
    stock: 4,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "4",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "4", name: "Aptamil" },
  },
  {
    id: "5",
    name: "Meiji Infant Formula 800g",
    short_description: "Sữa công thức Nhật Bản cho trẻ 0-12 tháng",
    price: 680000,
    sale_price: 650000,
    stock: 18,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "5",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "5", name: "Meiji" },
  },
  {
    id: "6",
    name: "Similac Ready-to-Feed 180ml",
    short_description: "Sữa nước tiện lợi, không cầnpha",
    price: 35000,
    sale_price: null,
    stock: 120,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "2",
    brand_id: "1",
    category: { id: "2", name: "Sữa nước" },
    brand: { id: "1", name: "Similac" },
  },
  {
    id: "7",
    name: "Enfamil A+ Liquid 946ml",
    short_description: "Sữa nước công thức dạng lỏng",
    price: 185000,
    sale_price: 175000,
    stock: 35,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "2",
    brand_id: "2",
    category: { id: "2", name: "Sữa nước" },
    brand: { id: "2", name: "Enfamil" },
  },
  {
    id: "8",
    name: "Abbott PediaSure Vanilla 900g",
    short_description: "Dinh dưỡng y học cho trẻ biếng ăn",
    price: 590000,
    sale_price: 550000,
    stock: 12,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "3",
    brand_id: "3",
    category: { id: "3", name: "Dinh dưỡng" },
    brand: { id: "3", name: "Abbott" },
  },
  {
    id: "9",
    name: "Meiji Growing Up 1-3 Years 800g",
    short_description: "Sữa bột cho trẻ đang lớn",
    price: 580000,
    sale_price: null,
    stock: 22,
    is_active: true,
    image_url: "/placeholder.jpg",
    category_id: "1",
    brand_id: "5",
    category: { id: "1", name: "Sữa bột" },
    brand: { id: "5", name: "Meiji" },
  },
  {
    id: "10",
    name: "Aptamil Gold+ Stage 1",
    short_description: "Sữa công thức cho trẻ 0-6 tháng",
    price: 490000,
    sale_price: 459000,
    stock: 8,
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
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading] = useState(false);
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

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [products, categoryFilter, search]);

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

  return (
    <div className="space-y-6">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Quản lý sản phẩm</h1>
        <p className="text-muted-foreground">
          Xem và cập nhật thông tin sản phẩm
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card className="py-2">
        <CardContent className="px-3">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white">
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
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
                      <TableCell>{product.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatPrice(product.sale_price || product.price)}
                          </p>
                          {product.sale_price && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stock <= 5
                              ? "destructive"
                              : product.stock <= 20
                                ? "secondary"
                                : "outline"
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
