import { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import ImageUploadDialog from "./ImageUploadDialog";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  ImagePlus,
  Link as LinkIcon,
  ChevronsUpDown,
  Check,
  X,
} from "lucide-react";

export default function EditArticleDialog({ open, onOpenChange, onSave, article }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-pink-500 underline",
        },
      }),
    ],
    content: "<p>Bắt đầu chỉnh sửa bài viết...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
  });

  // Fetch products on mount
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axiosInstance.get("/api/product");
      const productsData = response.data.data || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductsLoading(false);
    }
  };

  // Populate form when article changes
  useEffect(() => {
    if (article && editor) {
      const articleTitle = article.title || "";
      const articleAuthor = article.author || "";
      const articleTags = article.tags?.join(", ") || "";
      const articleImageUrl = article.imageUrl || "";
      const articleContent = article.content || "<p>Bắt đầu chỉnh sửa bài viết...</p>";
      const articleProducts = article.recommended_products || [];
      
      setTitle(articleTitle);
      setAuthor(articleAuthor);
      setTags(articleTags);
      setImageUrl(articleImageUrl);
      setSelectedProducts(articleProducts);
      editor.commands.setContent(articleContent);
      
      // Store initial values for comparison
      setInitialValues({
        title: articleTitle,
        author: articleAuthor,
        tags: articleTags,
        imageUrl: articleImageUrl,
        content: articleContent,
        recommended_products: articleProducts.map((p) => p._id || p.id),
      });
    }
  }, [article, editor]);

  // Memoize unsaved changes check for better performance
  const hasUnsavedChanges = useMemo(() => {
    if (!initialValues || !editor) return false;
    
    const currentContent = editor.getHTML();
    const currentProductIds = selectedProducts.map((p) => p._id || p.id).sort().join(",");
    const initialProductIds = (initialValues.recommended_products || []).sort().join(",");
    
    return (
      title !== initialValues.title ||
      author !== initialValues.author ||
      tags !== initialValues.tags ||
      imageUrl !== initialValues.imageUrl ||
      currentContent !== initialValues.content ||
      currentProductIds !== initialProductIds
    );
  }, [initialValues, editor, title, author, tags, imageUrl, selectedProducts]);

  const handleSubmit = async () => {
    if (!editor || !title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    setIsSubmitting(true);

    const htmlContent = editor.getHTML();
    const articleData = {
      title: title.trim(),
      content: htmlContent,
      author: author.trim() || "Admin",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: imageUrl.trim(),
      recommended_products: selectedProducts.map((p) => p._id || p.id),
    };

    try {
      await onSave(article.id, articleData);
      // Reset initial values after successful save
      setInitialValues(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating article:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    setInitialValues(null);
    onOpenChange(false);
  };

  const addImage = () => {
    setIsImageDialogOpen(true);
  };

  const handleInsertImage = (url) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleInsertThumbnail = (url) => {
    if (url) {
      setImageUrl(url);
    }
  };

  const addLink = () => {
    const url = prompt("Nhập URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề bài viết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Tác giả</Label>
            <Input
              id="author"
              placeholder="Nhập tên tác giả (mặc định: Admin)..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Thẻ</Label>
            <Input
              id="tags"
              placeholder="Nhập thẻ, phân cách bằng dấu phẩy (ví dụ: sữa, dinh dưỡng, bé yêu)..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Featured Products */}
          <div className="space-y-2">
            <Label>Sản phẩm đề xuất (Chọn nhiều)</Label>
            <Popover open={productsOpen} onOpenChange={setProductsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={productsOpen}
                  className="w-full justify-between"
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    "Đang tải sản phẩm..."
                  ) : selectedProducts.length > 0 ? (
                    `${selectedProducts.length} sản phẩm đã chọn`
                  ) : (
                    "Chọn sản phẩm để đề xuất..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[500px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy sản phẩm</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => {
                        const productId = product._id || product.id;
                        const isSelected = selectedProducts.some(
                          (p) => (p._id || p.id) === productId
                        );
                        return (
                          <CommandItem
                            key={productId}
                            value={product.name}
                            onSelect={() => {
                              if (isSelected) {
                                setSelectedProducts(
                                  selectedProducts.filter(
                                    (p) => (p._id || p.id) !== productId
                                  )
                                );
                              } else {
                                setSelectedProducts([
                                  ...selectedProducts,
                                  product,
                                ]);
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(product.sale_price || product.price)}
                              </p>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProducts.map((product) => (
                  <Badge
                    key={product._id || product.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      setSelectedProducts(
                        selectedProducts.filter(
                          (p) => (p._id || p.id) !== (product._id || product.id)
                        )
                      )
                    }
                  >
                    {product.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Image */}
          <div className="space-y-2">
            <Label>Hình ảnh đại diện</Label>
            <div className="flex gap-2 items-start">
              <Input
                placeholder="URL hình ảnh hoặc click nút để tải lên"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsThumbnailDialogOpen(true)}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Chọn ảnh
              </Button>
            </div>
            {imageUrl && (
              <div className="relative border rounded-lg p-2 bg-gray-50 group">
                <img
                  src={imageUrl}
                  alt="Thumbnail preview"
                  className="w-full h-auto rounded max-h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsThumbnailDialogOpen(true)}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Thay đổi ảnh
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setImageUrl("")}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <Label>
              Nội dung <span className="text-red-500">*</span>
            </Label>

            {/* Toolbar */}
            <div className="border rounded-t-lg bg-gray-50 p-1 flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-gray-200" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-gray-200" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>

              <div className="w-px bg-gray-300 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
                }
              >
                <Heading2 className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
                }
              >
                <Heading3 className="h-4 w-4" />
              </Button>

              <div className="w-px bg-gray-300 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
              >
                <List className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
              >
                <Quote className="h-4 w-4" />
              </Button>

              <div className="w-px bg-gray-300 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addImage}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>

              <Button type="button" variant="ghost" size="sm" onClick={addLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>

              <div className="w-px bg-gray-300 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Content */}
            <div className="border rounded-b-lg bg-white min-h-[300px] max-h-[400px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Cập nhật bài viết"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Tiptap Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1f2937;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin-bottom: 0.5rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #ec4899;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .ProseMirror strong {
          font-weight: 700;
          color: #ec4899;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }

        .ProseMirror a {
          color: #ec4899;
          text-decoration: underline;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>

      {/* Image Upload Dialog - For content images */}
      <ImageUploadDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onInsert={handleInsertImage}
      />

      {/* Thumbnail Upload Dialog - For article cover */}
      <ImageUploadDialog
        open={isThumbnailDialogOpen}
        onOpenChange={setIsThumbnailDialogOpen}
        onInsert={handleInsertThumbnail}
      />
    </Dialog>

    {/* Discard Changes Confirmation Dialog */}
    <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có thay đổi chưa được lưu. Nếu đóng dialog, tất cả thay đổi sẽ bị mất.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscardChanges}>
            Hủy thay đổi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
