import { useState, useEffect } from "react";
import {
  Package,
  Search,
  AlertCircle,
  Edit2,
  Save,
  X,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { formatPrice } from "@/lib/formatters";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, showLowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/product");
      const productsData = response.data.data || response.data || [];
      setProducts(productsData);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sản phẩm");
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (showLowStockOnly) {
      filtered = filtered.filter((product) => product.quantity <= 10);
    }

    filtered.sort((a, b) => a.quantity - b.quantity);
    setFilteredProducts(filtered);
  };

  const startEditing = (product) => {
    setEditingProduct(product._id);
    setEditingQuantity(product.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingQuantity("");
  };

  const saveQuantity = async (productId) => {
    const newQuantity = parseInt(editingQuantity, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    try {
      setUpdating(true);
      await axiosInstance.patch(`/api/product/${productId}`, {
        quantity: newQuantity,
      });
      toast.success("Cập nhật số lượng thành công");
      await fetchProducts();
      cancelEditing();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể cập nhật số lượng");
    } finally {
      setUpdating(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return {
        label: "Hết hàng",
        variant: "destructive",
        color: "text-red-600",
      };
    } else if (quantity <= 5) {
      return {
        label: "Sắp hết",
        variant: "destructive",
        color: "text-red-600",
      };
    } else if (quantity <= 10) {
      return {
        label: "Tồn kho thấp",
        variant: "secondary",
        color: "text-yellow-600",
      };
    } else {
      return { label: "Còn hàng", variant: "default", color: "text-green-600" };
    }
  };

  const lowStockCount = products.filter((p) => p.quantity <= 10).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Tồn kho</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi và cập nhật số lượng sản phẩm trong kho
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tất cả sản phẩm trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn kho thấp</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sản phẩm còn ≤ 10 đơn vị
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sản phẩm cần nhập hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={showLowStockOnly ? "default" : "outline"}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Chỉ tồn kho thấp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low stock alert */}
      {lowStockCount > 0 && !showLowStockOnly && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cảnh báo tồn kho</AlertTitle>
          <AlertDescription>
            Có {lowStockCount} sản phẩm có tồn kho thấp hoặc sắp hết hàng.{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setShowLowStockOnly(true)}
            >
              Xem ngay
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isEditing = editingProduct === product._id;
                const stockStatus = getStockStatus(product.quantity);

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={product.imageUrl?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(product.price)}
                        {product.brand?.name && (
                          <span className="ml-2">• {product.brand.name}</span>
                        )}
                      </p>
                      <div className="mt-1">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(e.target.value)}
                            className="w-24"
                            min="0"
                            disabled={updating}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveQuantity(product._id)}
                              disabled={updating}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              disabled={updating}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-right min-w-20">
                            <div
                              className={`text-2xl font-bold ${stockStatus.color}`}
                            >
                              {product.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              đơn vị
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
