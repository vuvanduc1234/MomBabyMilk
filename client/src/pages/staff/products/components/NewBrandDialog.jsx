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

export default function NewBrandDialog({
  isOpen,
  onClose,
  newBrand,
  setNewBrand,
  onCreateBrand,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo thương hiệu mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">
              Tên thương hiệu<span className="text-red-700">*</span>
            </Label>
            <Input
              id="brand-name"
              placeholder="Nhập tên thương hiệu"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-description">Mô tả</Label>
            <Textarea
              id="brand-description"
              placeholder="Nhập mô tả thương hiệu"
              value={newBrand.description}
              onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onClose();
              setNewBrand({ name: "", description: "" });
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              onCreateBrand();
              setNewBrand({ name: "", description: "" });
            }}
            disabled={!newBrand.name}
          >
            Tạo thương hiệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
