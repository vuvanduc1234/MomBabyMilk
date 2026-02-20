import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function ImageUploadDialog({ open, onOpenChange, onInsert }) {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axiosInstance.post("/api/upload/blog-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = response.data.url || response.data.data?.url;
      
      if (uploadedUrl) {
        onInsert(uploadedUrl);
        handleClose();
      } else {
        setError("Không nhận được URL từ server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải ảnh lên. Vui lòng thử lại."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertUrl = () => {
    if (!imageUrl.trim()) {
      setError("Vui lòng nhập URL hình ảnh");
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onInsert(imageUrl.trim());
      handleClose();
    } catch {
      setError("URL không hợp lệ");
    }
  };

  const handleClose = () => {
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
    setActiveTab("upload");
    onOpenChange(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chèn hình ảnh</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload className="inline h-4 w-4 mr-2" />
            Tải lên
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "url"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <LinkIcon className="inline h-4 w-4 mr-2" />
            URL
          </button>
        </div>

        <div className="py-4">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Chọn file ảnh</Label>
                <div className="mt-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="relative border rounded-lg p-2 bg-gray-50">
                  <button
                    onClick={clearFile}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded max-h-64 object-contain"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedFile?.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* URL Tab */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">URL hình ảnh</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setError("");
                  }}
                  className="mt-2"
                />
              </div>

              {/* URL Preview */}
              {imageUrl && (
                <div className="border rounded-lg p-2 bg-gray-50">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-auto rounded max-h-64 object-contain"
                    onError={() => setError("Không thể tải ảnh từ URL này")}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={activeTab === "upload" ? handleUpload : handleInsertUrl}
            disabled={
              isUploading ||
              (activeTab === "upload" ? !selectedFile : !imageUrl)
            }
          >
            {isUploading ? "Đang tải lên..." : "Chèn ảnh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
