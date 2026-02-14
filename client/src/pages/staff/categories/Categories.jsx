import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import NewCategoryDialog from "./components/NewCategoryDialog";
import EditCategoryDialog from "./components/EditCategoryDialog";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "./services/categoryApi";
import { getAllBrands } from "./services/brandApi";
import { toast } from "sonner";

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [parentCategoryFilter, setParentCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentCategory: null,
  });
  const pageSize = 15;

  // Check for openDialog query parameter
  useEffect(() => {
    const openDialog = searchParams.get('openDialog');
    if (openDialog === '1') {
      setIsNewCategoryDialogOpen(true);
      // Remove the query parameter after opening the dialog
      searchParams.delete('openDialog');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch categories and brands on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        getAllCategories(),
        getAllBrands(),
      ]);

      setCategories(categoriesResponse.data || []);
      setBrands(brandsResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const rootCategories = categories.filter((c) => !c.parentCategory).length;
    const childCategories = totalCategories - rootCategories;
    return { totalCategories, rootCategories, childCategories };
  }, [categories]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Parent category filter
    if (parentCategoryFilter !== "all") {
      if (parentCategoryFilter === "root") {
        filtered = filtered.filter((c) => !c.parentCategory);
      } else {
        filtered = filtered.filter(
          (c) => c.parentCategory?._id === parentCategoryFilter,
        );
      }
    }

    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter((c) =>
        c.brands?.some((b) => b._id === brandFilter),
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchLower),
      );
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, parentCategoryFilter, brandFilter, search]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, page]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCategories(paginatedCategories.map((c) => c._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId, checked) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
      );
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await createCategory(categoryData);
      toast.success("Tạo danh mục thành công");
      await fetchData();
      setIsNewCategoryDialogOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.message || "Không thể tạo danh mục");
      throw error;
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      await updateCategory(id, categoryData);
      toast.success("Cập nhật danh mục thành công");
      await fetchData();
      setIsEditCategoryDialogOpen(false);
      setCategoryToEdit(null);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Không thể cập nhật danh mục");
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast.success("Xóa danh mục thành công");
      await fetchData();
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Không thể xóa danh mục");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Vui lòng chọn ít nhất một danh mục để xóa");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa ${selectedCategories.length} danh mục đã chọn?`,
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedCategories.map((id) => deleteCategory(id)));
      toast.success(`Đã xóa ${selectedCategories.length} danh mục`);
      setSelectedCategories([]);
      await fetchData();
    } catch (error) {
      console.error("Error deleting categories:", error);
      toast.error(error.message || "Không thể xóa danh mục");
    }
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setIsEditCategoryDialogOpen(true);
  };

  return (
    <>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="pt-2 pb-6">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Quản lý danh mục
            </h1>
          </div>

          <div className="sticky top-20 bg-white border rounded-lg shadow-sm p-4 space-y-6 max-h-[calc(100vh-22rem)] overflow-y-auto mb-4">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Thống kê
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng danh mục:</span>
                <span className="font-semibold">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Danh mục gốc:</span>
                <span className="font-semibold">{stats.rootCategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Danh mục con:</span>
                <span className="font-semibold">{stats.childCategories}</span>
              </div>
            </div>
          </div>

          <div className="sticky top-20 bg-white border rounded-lg shadow-sm p-4 space-y-6 max-h-[calc(100vh-22rem)] overflow-y-auto">
            <div>
              <h3 className="font-semibold text-sm mb-3">Bộ lọc</h3>
            </div>

            {/* Parent Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Danh mục cha</Label>
              <Select
                value={parentCategoryFilter}
                onValueChange={setParentCategoryFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="root">Danh mục gốc</SelectItem>
                    {categories.map((cat) => (
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
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setParentCategoryFilter("all");
                  setBrandFilter("all");
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
          {/* Search and Create Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Button onClick={() => setIsNewCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo danh mục mới
            </Button>
          </div>

          {/* Content Card */}
          <Card className="py-2">
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
              ) : filteredCategories.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Không tìm thấy danh mục nào</p>
                </div>
              ) : (
                <>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      {selectedCategories.length > 0 && (
                        <>
                          <p className="">
                            Đã chọn {selectedCategories.length}
                          </p>
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
                        Trang {page} / {totalPages} ({filteredCategories.length}{" "}
                        danh mục)
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

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              paginatedCategories.length > 0 &&
                              selectedCategories.length ===
                                paginatedCategories.length
                            }
                            onCheckedChange={handleSelectAll}
                            title="Chọn tất cả danh mục trên trang này"
                          />
                        </TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Danh mục cha</TableHead>
                        <TableHead className="text-center">
                          Thương hiệu
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCategories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCategories.includes(
                                category._id,
                              )}
                              onCheckedChange={(checked) =>
                                handleSelectCategory(category._id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description || (
                              <span className="text-muted-foreground italic">
                                Không có mô tả
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {category.parentCategory ? (
                              <Badge variant="outline">
                                {category.parentCategory.name}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Danh mục gốc</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {category.brands?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteCategory(category._id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Hiển thị {(page - 1) * pageSize + 1} -{" "}
                        {Math.min(page * pageSize, filteredCategories.length)}{" "}
                        trong tổng số {filteredCategories.length} danh mục
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => (
                            <Button
                              key={i}
                              variant={page === i + 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(i + 1)}
                              className="w-8"
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <NewCategoryDialog
        isOpen={isNewCategoryDialogOpen}
        onClose={() => setIsNewCategoryDialogOpen(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onCreateCategory={handleCreateCategory}
        brands={brands}
        categories={categories}
      />

      <EditCategoryDialog
        isOpen={isEditCategoryDialogOpen}
        onClose={() => {
          setIsEditCategoryDialogOpen(false);
          setCategoryToEdit(null);
        }}
        category={categoryToEdit}
        brands={brands}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
      />
    </>
  );
}
