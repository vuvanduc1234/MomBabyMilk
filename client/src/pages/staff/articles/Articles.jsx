import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NewArticleDialog from "./components/NewArticleDialog";
import EditArticleDialog from "./components/EditArticleDialog";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function StaffArticles() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredArticles.length / pageSize);
  const paginatedArticles = filteredArticles.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles when search changes
  useEffect(() => {
    filterArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, search]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/blogs");
      const blogs = response.data.data || response.data;

      // Transform blogs to match the article structure
      const transformedArticles = blogs.map((blog) => {
        // Extract plain text excerpt from HTML content
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = blog.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const excerpt =
          textContent.slice(0, 100) + (textContent.length > 100 ? "..." : "");

        return {
          id: blog._id,
          title: blog.title,
          content: blog.content,
          subtitle: excerpt,
          author: blog.author || "Admin",
          tags: blog.tags || [],
          imageUrl: blog.image,
          recommended_products: blog.recommended_products || [],
          category: null, // TODO: Add category support
          status: "published", // TODO: Add status field to BlogModel
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
        };
      });

      setArticles(transformedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.author.toLowerCase().includes(searchLower),
      );
    }

    setFilteredArticles(filtered);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = paginatedArticles.map((article) => article.id);
      setSelectedArticles(allIds);
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (articleId, checked) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, articleId]);
    } else {
      setSelectedArticles((prev) => prev.filter((id) => id !== articleId));
    }
  };

  const handleSaveArticle = async (articleData) => {
    try {
      await axiosInstance.post("/api/blogs", articleData);
      toast.success("Bài viết đã được tạo thành công!");

      // Refresh articles list
      await fetchArticles();
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Không thể tạo bài viết. Vui lòng thử lại.");
      throw error;
    }
  };

  const handleUpdateArticle = async (articleId, articleData) => {
    try {
      await axiosInstance.put(`/api/blogs/${articleId}`, articleData);
      toast.success("Bài viết đã được cập nhật thành công!");

      // Refresh articles list
      await fetchArticles();
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Không thể cập nhật bài viết. Vui lòng thử lại.");
      throw error;
    }
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogChange = (open) => {
    // If dialog was open and is now closing, refresh articles list
    if (isEditDialogOpen && !open) {
      fetchArticles();
    }
    setIsEditDialogOpen(open);
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await axiosInstance.delete(`/api/blogs/${articleToDelete.id}`);
      toast.success("Bài viết đã được xóa thành công!");

      // Clear selection if deleted article was selected
      setSelectedArticles((prev) =>
        prev.filter((id) => id !== articleToDelete.id),
      );

      // Refresh articles list
      await fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Không thể xóa bài viết. Vui lòng thử lại.");
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedArticles.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      // Delete all selected articles
      await Promise.all(
        selectedArticles.map((id) => axiosInstance.delete(`/api/blogs/${id}`)),
      );

      toast.success(`Đã xóa ${selectedArticles.length} bài viết thành công!`);

      // Clear selection
      setSelectedArticles([]);

      // Refresh articles list
      await fetchArticles();
    } catch (error) {
      console.error("Error deleting articles:", error);
      toast.error("Không thể xóa bài viết. Vui lòng thử lại.");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const isAllSelected =
    paginatedArticles.length > 0 &&
    paginatedArticles.every((article) => selectedArticles.includes(article.id));
  const isSomeSelected = selectedArticles.length > 0 && !isAllSelected;

  return (
    <>
      <div className="space-y-5">
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Quản lý bài viết
          </h1>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tiêu đề bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết mới
            </Button>
          </div>
        </div>

        {/* Articles Table */}
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
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-24" />
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
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-8" />
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
                    {selectedArticles.length > 0 && (
                      <>
                        <p className="">Đã chọn {selectedArticles.length}</p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDeleteClick}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa đã chọn
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Trang {page} / {totalPages || 1} (
                      {filteredArticles.length} bài viết)
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
                    <TableHeader className="sticky top-0 bg-white z-20 ">
                      <TableRow className="hover:bg-white">
                        <TableHead className="w-8 bg-white">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all articles"
                            className={isSomeSelected ? "opacity-50" : ""}
                            title="Chọn tất cả bài viết"
                          />
                        </TableHead>
                        <TableHead className="bg-white">Mã bài viết</TableHead>
                        <TableHead className="bg-white">Tiêu đề</TableHead>
                        <TableHead className="bg-white">Tác giả</TableHead>
                        <TableHead className="bg-white">Trạng thái</TableHead>
                        <TableHead className="text-right bg-white"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedArticles.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-12"
                          >
                            {articles.length === 0
                              ? "Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!"
                              : "Không tìm thấy bài viết phù hợp với bộ lọc"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedArticles.map((article) => (
                          <TableRow key={article.id} className="group">
                            <TableCell>
                              <Checkbox
                                checked={selectedArticles.includes(article.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectArticle(article.id, checked)
                                }
                                aria-label={`Select ${article.title}`}
                              />
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {article.id.slice(-6).toUpperCase()}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    article.imageUrl ||
                                    "https://via.placeholder.com/150?text=No+Image"
                                  }
                                  alt={article.title}
                                  className="w-12 h-12 rounded object-cover bg-gray-100"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=No+Image";
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="font-medium line-clamp-1">
                                    {article.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {article.subtitle || "Không có mô tả"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{article.author}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  article.status === "published"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {article.status === "published"
                                  ? "Đã xuất bản"
                                  : "Bản nháp"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(article)}
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xóa bài viết"
                                  onClick={() => handleDeleteClick(article)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Article Dialog */}
      <NewArticleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveArticle}
      />

      {/* Edit Article Dialog */}
      <EditArticleDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
        onSave={handleUpdateArticle}
        article={editingArticle}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{articleToDelete?.title}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedArticles.length} bài viết đã
              chọn? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
