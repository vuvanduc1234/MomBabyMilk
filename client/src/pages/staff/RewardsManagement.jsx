import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllRewardItems,
  createRewardItem,
  updateRewardItem,
  deleteRewardItem,
} from "@/services/pointService";
import { AlertCircle, Edit, Gift, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "@/lib/axios";

export default function RewardsManagement() {
  const [rewards, setRewards] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsCost: "",
    voucherId: "",
    quantity: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRewards();
    fetchVouchers();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRewardItems();
      setRewards(response.data || []);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách phần thưởng",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axios.get("/api/voucher");
      setVouchers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
    }
  };

  const handleOpenDialog = (reward = null) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        name: reward.name || "",
        description: reward.description || "",
        pointsCost: reward.pointsCost?.toString() || "",
        voucherId: reward.voucherId?._id || reward.voucherId || "",
        quantity: reward.quantity !== null ? reward.quantity?.toString() : "",
        isActive: reward.isActive ?? true,
      });
    } else {
      setEditingReward(null);
      setFormData({
        name: "",
        description: "",
        pointsCost: "",
        voucherId: "",
        quantity: "",
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReward(null);
    setFormData({
      name: "",
      description: "",
      pointsCost: "",
      voucherId: "",
      quantity: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.pointsCost || !formData.voucherId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        pointsCost: parseInt(formData.pointsCost),
        voucherId: formData.voucherId,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        isActive: formData.isActive,
      };

      if (editingReward) {
        await updateRewardItem(editingReward._id, payload);
        toast.success("Cập nhật phần thưởng thành công");
      } else {
        await createRewardItem(payload);
        toast.success("Tạo phần thưởng mới thành công");
      }

      handleCloseDialog();
      fetchRewards();
    } catch (err) {
      console.error("Error submitting reward:", err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rewardId) => {
    if (!confirm("Bạn có chắc muốn xóa phần thưởng này?")) return;

    try {
      await deleteRewardItem(rewardId);
      toast.success("Xóa phần thưởng thành công");
      fetchRewards();
    } catch (err) {
      console.error("Error deleting reward:", err);
      toast.error(err.response?.data?.message || "Không thể xóa phần thưởng");
    }
  };

  const formatVoucherInfo = (voucher) => {
    if (!voucher) return "N/A";
    const discount = voucher.discountPercentage
      ? `${voucher.discountPercentage}%`
      : "N/A";
    const minOrder = voucher.minOrderValue
      ? ` (Đơn tối thiểu: ${voucher.minOrderValue.toLocaleString()}đ)`
      : "";
    return `${voucher.code} - Giảm ${discount}${minOrder}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-500" />
            Quản Lý Phần Thưởng Đổi Điểm
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Phần Thưởng
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-sm text-gray-500">Đang tải...</div>
            </div>
          ) : rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Gift className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">
                Chưa có phần thưởng nào
              </p>
              <p className="text-xs text-gray-400">
                Nhấn "Thêm Phần Thưởng" để tạo mới
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên phần thưởng</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead className="text-right">Điểm cần</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-center">Đã đổi</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reward.name}</p>
                          {reward.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {reward.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {reward.voucherId
                            ? formatVoucherInfo(reward.voucherId)
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-pink-600">
                          {reward.pointsCost?.toLocaleString()} điểm
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {reward.quantity !== null ? reward.quantity : "∞"}
                      </TableCell>
                      <TableCell className="text-center">
                        {reward.totalRedeemed || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={reward.isActive ? "default" : "secondary"}
                        >
                          {reward.isActive ? "Hoạt động" : "Dừng"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(reward)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reward._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? "Chỉnh Sửa Phần Thưởng" : "Thêm Phần Thưởng Mới"}
            </DialogTitle>
            <DialogDescription>
              Tạo phần thưởng để khách hàng đổi điểm lấy voucher
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                Tên phần thưởng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Voucher giảm 50K"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả chi tiết về phần thưởng"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsCost">
                  Điểm cần đổi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pointsCost"
                  type="number"
                  value={formData.pointsCost}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsCost: e.target.value })
                  }
                  placeholder="VD: 500"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity">
                  Số lượng (để trống = không giới hạn)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="VD: 100"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="voucherId">
                Voucher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.voucherId}
                onValueChange={(value) =>
                  setFormData({ ...formData, voucherId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn voucher" />
                </SelectTrigger>
                <SelectContent>
                  {vouchers.map((voucher) => (
                    <SelectItem key={voucher._id} value={voucher._id}>
                      {formatVoucherInfo(voucher)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Kích hoạt phần thưởng</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Đang xử lý..."
                  : editingReward
                    ? "Cập nhật"
                    : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
