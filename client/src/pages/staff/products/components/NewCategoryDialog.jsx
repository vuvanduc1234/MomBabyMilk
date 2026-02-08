import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewCategoryDialog({
  isOpen,
  onClose,
  newCategory,
  setNewCategory,
  onCreateCategory,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo danh mục mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Tên danh mục<span className="text-red-700">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="Nhập tên danh mục"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Mô tả</Label>
            <Textarea
              id="category-description"
              placeholder="Nhập mô tả danh mục"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onClose();
              setNewCategory({ name: "", description: "" });
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              onCreateCategory();
              setNewCategory({ name: "", description: "" });
            }}
            disabled={!newCategory.name}
          >
            Tạo danh mục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
