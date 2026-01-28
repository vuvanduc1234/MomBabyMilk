import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  Package,
  History,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Aptamil Essensis 800g",
    stock: 4,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Aptamil" },
  },
  {
    id: "2",
    name: "Enfamil A+ 400g",
    stock: 5,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Enfamil" },
  },
  {
    id: "3",
    name: "Meiji Infant Formula 800g",
    stock: 6,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Meiji" },
  },
  {
    id: "4",
    name: "Similac Gain Plus 900g",
    stock: 3,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Similac" },
  },
  {
    id: "5",
    name: "Abbott Grow Gold 1.7kg",
    stock: 7,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Abbott" },
  },
  {
    id: "6",
    name: "Aptamil Gold+ Stage 1",
    stock: 8,
    is_active: false,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Aptamil" },
  },
  {
    id: "7",
    name: "Abbott PediaSure Vanilla 900g",
    stock: 12,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Dinh dưỡng" },
    brand: { name: "Abbott" },
  },
  {
    id: "8",
    name: "Enfamil A+ Liquid 946ml",
    stock: 35,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa nước" },
    brand: { name: "Enfamil" },
  },
  {
    id: "9",
    name: "Meiji Growing Up 1-3 Years 800g",
    stock: 22,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Meiji" },
  },
  {
    id: "10",
    name: "Similac Ready-to-Feed 180ml",
    stock: 120,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa nước" },
    brand: { name: "Similac" },
  },
  {
    id: "11",
    name: "Enfamil Premium 900g",
    stock: 0,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Enfamil" },
  },
  {
    id: "12",
    name: "Abbott Similac Mom 900g",
    stock: 0,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Abbott" },
  },
  {
    id: "13",
    name: "Meiji HP 850g",
    stock: 15,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Meiji" },
  },
  {
    id: "14",
    name: "Aptamil Pronutra 800g",
    stock: 28,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Aptamil" },
  },
  {
    id: "15",
    name: "Similac Total Comfort 820g",
    stock: 9,
    is_active: true,
    image_url: "/placeholder.jpg",
    category: { name: "Sữa bột" },
    brand: { name: "Similac" },
  },
];

export default function StaffInventory() {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [adjustDialog, setAdjustDialog] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [isLoading] = useState(false);
  const pageSize = 15;

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    return { totalProducts, outOfStock, lowStock, totalStock };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((p) => p.stock === 0);
    } else if (stockFilter === "available") {
      filtered = filtered.filter((p) => p.stock > 10);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower),
      );
    }

    // Sort by stock (ascending)
    return filtered.sort((a, b) => a.stock - b.stock);
  }, [products, stockFilter, search]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page]);

  const updateStock = (productId, newStock) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, stock: newStock } : product,
      ),
    );
    setAdjustDialog(null);
    setAdjustQuantity(0);
    setAdjustReason("");
    console.log("Đã cập nhật tồn kho");
  };

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const handleAdjustStock = () => {
    if (!adjustDialog || adjustQuantity <= 0) return;

    const currentStock = adjustDialog.product.stock;
    const newStock =
      adjustDialog.type === "add"
        ? currentStock + adjustQuantity
        : Math.max(0, currentStock - adjustQuantity);

    updateStock(adjustDialog.product.id, newStock);
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">Hết hàng</Badge>;
    if (stock < 10)
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Sắp hết
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-green-600 border-green-300">
        Còn hàng
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Quản lý kho hàng
        </h1>
        <p className="text-muted-foreground">
          Theo dõi và cập nhật tồn kho sản phẩm
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng tồn kho
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sắp hết hàng
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.lowStock}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hết hàng
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
          </CardContent>
        </Card>
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
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card">
            <SelectValue placeholder="Trạng thái kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="low">Sắp hết hàng (&lt;10)</SelectItem>
              <SelectItem value="out">Hết hàng</SelectItem>
              <SelectItem value="available">Còn hàng (&gt;10)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
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
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
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
                        <span
                          className={`text-lg font-bold ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-green-500"}`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{getStockBadge(product.stock)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAdjustDialog({ product, type: "add" })
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Nhập
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAdjustDialog({ product, type: "remove" })
                            }
                            disabled={product.stock === 0}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Xuất
                          </Button>
                        </div>
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

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustDialog?.type === "add"
                ? "Nhập hàng"
                : "Xuất hàng / Hao hụt"}
            </DialogTitle>
          </DialogHeader>
          {adjustDialog && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <img
                  src={adjustDialog.product.image_url || "/placeholder.svg"}
                  alt={adjustDialog.product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{adjustDialog.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Tồn kho hiện tại:{" "}
                    <strong>{adjustDialog.product.stock}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Số lượng {adjustDialog.type === "add" ? "nhập" : "xuất"}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={adjustQuantity}
                  onChange={(e) =>
                    setAdjustQuantity(parseInt(e.target.value) || 0)
                  }
                  placeholder="Nhập số lượng..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do{" "}
                  {adjustDialog.type === "remove" && "(hư hỏng, mất mát, etc.)"}
                </Label>
                <Textarea
                  id="reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={
                    adjustDialog.type === "add"
                      ? "VD: Nhập hàng từ nhà cung cấp ABC"
                      : "VD: Hàng bị hư hỏng trong kho"
                  }
                  rows={2}
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Tồn kho sau khi{" "}
                  {adjustDialog.type === "add" ? "nhập" : "xuất"}:{" "}
                  <strong
                    className={
                      adjustDialog.type === "add"
                        ? "text-green-600"
                        : "text-amber-600"
                    }
                  >
                    {adjustDialog.type === "add"
                      ? adjustDialog.product.stock + adjustQuantity
                      : Math.max(
                          0,
                          adjustDialog.product.stock - adjustQuantity,
                        )}
                  </strong>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={adjustQuantity <= 0}
              variant={adjustDialog?.type === "add" ? "default" : "secondary"}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
