import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Skeleton } from "@/components/ui/skeleton";
import NewBrandDialog from "./components/NewBrandDialog";
import EditBrandDialog from "./components/EditBrandDialog";
import {
  getAllBrands,
  createBrand,
  deleteBrand,
  updateBrand,
  uploadBrandImage,
} from "./services/brandApi";
import { getAllCategories } from "./services/categoryApi";
import { toast } from "sonner";

export default function Brands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isNewBrandDialogOpen, setIsNewBrandDialogOpen] = useState(false);
  const [isEditBrandDialogOpen, setIsEditBrandDialogOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState(null);
  const [newBrand, setNewBrand] = useState({
    name: "",
    description: "",
    logoUrl: "",
    categories: [],
  });
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const pageSize = 15;

  // Check for openDialog query parameter
  useEffect(() => {
    const openDialog = searchParams.get('openDialog');
    if (openDialog === '1') {
      setIsNewBrandDialogOpen(true);
      // Remove the query parameter after opening the dialog
      searchParams.delete('openDialog');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch brands and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          getAllBrands(),
          getAllCategories(),
        ]);

        setBrands(brandsResponse.data || []);
        setFetchedCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBrands = brands.length;
    return { totalBrands };
  }, [brands]);

  // Filter brands
  const filteredBrands = useMemo(() => {
    let filtered = brands;

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((b) =>
        b.categories?.some((cat) => cat._id === categoryFilter),
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((b) =>
        b.name.toLowerCase().includes(searchLower),
      );
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [brands, categoryFilter, search]);

  const paginatedBrands = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredBrands.slice(start, end);
  }, [filteredBrands, page]);

  const totalPages = Math.ceil(filteredBrands.length / pageSize);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(paginatedBrands.map((b) => b._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (brandId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, brandId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== brandId));
    }
  };

  const handleBulkDelete = async () => {
    console.log("[handleBulkDelete] Deleting brands:", selectedProducts);

    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thương hiệu để xóa");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa ${selectedProducts.length} thương hiệu đã chọn?`,
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedProducts.map((id) => deleteBrand(id));
      await Promise.all(deletePromises);

      console.log("[handleBulkDelete] Successfully deleted brands");

      setBrands((prev) =>
        prev.filter((b) => !selectedProducts.includes(b._id)),
      );
      setSelectedProducts([]);

      toast.success(
        `Đã xóa ${selectedProducts.length} thương hiệu thành công!`,
      );
    } catch (error) {
      console.error("[handleBulkDelete] Error deleting brands:", error);
      const errorMsg = error.message || "Không thể xóa thương hiệu";
      toast.error(`Lỗi: ${errorMsg}`);
    }
  };

  const handleCreateBrand = async (brandData) => {
    try {
      // Use already uploaded logoUrl if available, otherwise upload the file
      let logoUrl = brandData.logoUrl || "";

      // If there's a logo file and no logoUrl yet, upload it
      if (brandData.logo && brandData.logo instanceof File && !logoUrl) {
        const uploadResponse = await uploadBrandImage(brandData.logo);
        logoUrl = uploadResponse.data?.logoUrl || "";
      }

      const response = await createBrand({
        name: brandData.name,
        description: brandData.description,
        logoUrl: logoUrl,
        categories: brandData.categories || [],
      });

      setBrands((prev) => [...prev, response.data]);
      setIsNewBrandDialogOpen(false);
      setNewBrand({ name: "", description: "", logoUrl: "", categories: [] });
      toast.success("Tạo thương hiệu thành công!");
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error(error.message || "Không thể tạo thương hiệu");
    }
  };

  const handleUpdateBrand = async (brandData) => {
    if (!brandToEdit) return;

    try {
      // Use already uploaded logoUrl if available
      let logoUrl = brandData.logoUrl || brandToEdit.logoUrl || "";

      const response = await updateBrand(brandToEdit._id, {
        name: brandData.name,
        description: brandData.description,
        logoUrl: logoUrl,
        categories: brandData.categories || [],
      });

      setBrands((prev) =>
        prev.map((b) => (b._id === brandToEdit._id ? response.data : b)),
      );
      setIsEditBrandDialogOpen(false);
      setBrandToEdit(null);
      toast.success("Cập nhật thương hiệu thành công!");
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error(error.message || "Không thể cập nhật thương hiệu");
    }
  };

  const isAllSelected =
    paginatedBrands.length > 0 &&
    paginatedBrands.every((b) => selectedProducts.includes(b._id));
  const isSomeSelected =
    paginatedBrands.some((b) => selectedProducts.includes(b._id)) &&
    !isAllSelected;

  // Get unique categories for filters
  const categories = fetchedCategories;

  return (
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="pt-2 pb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Quản lý thương hiệu
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
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pt-2 flex-1 space-y-5">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm thương hiệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>

          <Button onClick={() => setIsNewBrandDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo thương hiệu mới
          </Button>
        </div>

        {/* Inventory Table */}
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
                        <Skeleton className="h-4 w-32" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-20" />
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
                {/* Top Bar with Selection and Pagination */}
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
                    <p className="text-sm text-muted-foreground">
                      Trang {page} / {totalPages} ({filteredBrands.length}{" "}
                      thương hiệu)
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
                </div>

                <ScrollArea className="w-full h-[calc(100vh-14rem)]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-20">
                      <TableRow className="hover:bg-white">
                        <TableHead className="w-8 bg-white">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all brands on this page"
                            className={isSomeSelected ? "opacity-50" : ""}
                            title="Chọn tất cả thương hiệu trên trang này"
                          />
                        </TableHead>
                        <TableHead className="bg-white">Thương hiệu</TableHead>
                        <TableHead className="bg-white">Danh mục</TableHead>
                        <TableHead className="bg-white">Mô tả</TableHead>
                        <TableHead className="text-right bg-white">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBrands.map((brand) => (
                        <TableRow key={brand._id} className="group">
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.includes(brand._id)}
                              onCheckedChange={(checked) =>
                                handleSelectProduct(brand._id, checked)
                              }
                              aria-label={`Select ${brand.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {brand.logoUrl && (
                                <img
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <p className="font-medium line-clamp-1">
                                {brand.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-100">
                              {brand.categories?.map((cat) => (
                                <Badge key={cat._id} variant="secondary">
                                  {cat.name}
                                </Badge>
                              )) || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="line-clamp-2 max-w-xs">
                              {brand.description || "Không có mô tả"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setBrandToEdit(brand);
                                  setIsEditBrandDialogOpen(true);
                                }}
                              >
                                <Edit />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `Bạn có chắc muốn xóa thương hiệu "${brand.name}"?`,
                                    )
                                  ) {
                                    try {
                                      await deleteBrand(brand._id);
                                      setBrands((prev) =>
                                        prev.filter((b) => b._id !== brand._id),
                                      );
                                      toast.success(
                                        "Xóa thương hiệu thành công!",
                                      );
                                    } catch (error) {
                                      toast.error(
                                        error.message ||
                                          "Không thể xóa thương hiệu",
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 />
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

      {/* New Brand Dialog */}
      <NewBrandDialog
        isOpen={isNewBrandDialogOpen}
        onClose={() => setIsNewBrandDialogOpen(false)}
        newBrand={newBrand}
        setNewBrand={setNewBrand}
        categories={fetchedCategories}
        onCreateBrand={handleCreateBrand}
      />

      {/* Edit Brand Dialog */}
      <EditBrandDialog
        isOpen={isEditBrandDialogOpen}
        onClose={() => {
          setIsEditBrandDialogOpen(false);
          setBrandToEdit(null);
        }}
        brand={brandToEdit}
        categories={fetchedCategories}
        onUpdateBrand={handleUpdateBrand}
      />
    </div>
  );
}
