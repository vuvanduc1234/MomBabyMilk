import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Plus,
  Tag,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Shuffle,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate as formatDateLib, formatPrice } from "@/lib/formatters";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return formatDateLib(d);
};

const defaultForm = {
  code: "",
  discountPercentage: "",
  description: "",
  expiryDate: "",
  minOrderValue: "",
};
const defaultRandomForm = {
  discountPercentage: 10,
  description: "",
  expiryDate: "",
  minOrderValue: 0,
  quantity: 1,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function VoucherManagement() {
  // Data
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [createRandomDialogOpen, setCreateRandomDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create form
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Random form
  const [randomForm, setRandomForm] = useState(defaultRandomForm);

  // Assign
  const [assignVoucherCode, setAssignVoucherCode] = useState("");
  const [assignMode, setAssignMode] = useState("user");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(1);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setFormErrors((p) => ({ ...p, [field]: "" }));
  };

  const getVoucherStatus = (v) => {
    if (v.status === "inactive" || v.isActive === false) return "inactive";
    if (v.expiryDate && new Date(v.expiryDate) <= new Date()) return "expired";
    return "active";
  };

  const getStatusBadge = (v) => {
    const s = getVoucherStatus(v);
    if (s === "active")
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Đang hoạt động
        </Badge>
      );
    if (s === "expired")
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Hết hạn
        </Badge>
      );
    return (
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
        Tạm dừng
      </Badge>
    );
  };

  const normalizeVoucher = (v) => ({
    id: v._id || v.id,
    code: v.code,
    discountPercentage: v.discountPercentage ?? v.discount ?? 0,
    description: v.description || "",
    expiryDate: v.expiryDate || v.expiry_date || "",
    minOrderValue: v.minOrderValue ?? v.min_order_value ?? 0,
    isActive: v.isActive,
    status: v.status || (v.isActive ? "active" : "inactive"),
    createdAt: v.createdAt || v.created_at || "",
  });

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/api/voucher");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.vouchers || [];
      setVouchers(list.map(normalizeVoucher));
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // ── Filter & paginate ──────────────────────────────────────────────────────
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" || getVoucherStatus(v) === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vouchers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = {
    total: vouchers.length,
    active: vouchers.filter((v) => getVoucherStatus(v) === "active").length,
    expired: vouchers.filter((v) => getVoucherStatus(v) === "expired").length,
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 1500);
      })
      .catch(() => {});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = "Mã voucher không được để trống";
    else if (!/^[A-Z0-9_-]+$/.test(form.code))
      errors.code = "Chỉ dùng chữ in hoa, số, dấu _ hoặc -";
    else if (vouchers.some((v) => v.code.toUpperCase() === form.code))
      errors.code = "Mã này đã tồn tại";

    const pct = Number(form.discountPercentage);
    if (!form.discountPercentage)
      errors.discountPercentage = "Vui lòng nhập % giảm giá";
    else if (isNaN(pct) || pct <= 0 || pct > 100)
      errors.discountPercentage = "% giảm giá phải từ 1 đến 100";

    if (!form.description.trim()) errors.description = "Vui lòng nhập mô tả";

    if (!form.expiryDate) errors.expiryDate = "Vui lòng chọn ngày hết hạn";
    else if (new Date(form.expiryDate) <= new Date())
      errors.expiryDate = "Ngày hết hạn phải sau hôm nay";

    const minVal = Number(form.minOrderValue);
    if (!form.minOrderValue)
      errors.minOrderValue = "Vui lòng nhập giá trị đơn tối thiểu";
    else if (isNaN(minVal) || minVal < 0)
      errors.minOrderValue = "Giá trị không hợp lệ";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateDialog = () => {
    setForm(defaultForm);
    setFormErrors({});
    setSubmitResult(null);
    setCreateDialogOpen(true);
  };

  const handleCreateVoucher = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      await axiosInstance.post("/api/voucher/create-manual", {
        code: form.code.trim(),
        discountPercentage: Number(form.discountPercentage),
        description: form.description.trim(),
        expiryDate: form.expiryDate,
        minOrderValue: Number(form.minOrderValue),
      });
      setSubmitResult({
        success: true,
        message: `Voucher "${form.code}" đã được tạo thành công!`,
      });
      await fetchVouchers();
      setTimeout(() => {
        setCreateDialogOpen(false);
        setForm(defaultForm);
        setSubmitResult(null);
      }, 1500);
    } catch (err) {
      setSubmitResult({
        success: false,
        message: err.response?.data?.message || "Tạo voucher thất bại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/voucher/${selectedVoucher.id}`);
      await fetchVouchers();
      toast.success("Xóa voucher thành công!");
      setDeleteDialogOpen(false);
      setSelectedVoucher(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa voucher");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateVoucher = async () => {
    if (!editingVoucher) return;
    try {
      await axiosInstance.put(`/api/voucher/${editingVoucher.id}`, {
        discountPercentage: Number(editingVoucher.discountPercentage),
        description: editingVoucher.description,
        expiryDate: editingVoucher.expiryDate,
        minOrderValue: Number(editingVoucher.minOrderValue),
        status: editingVoucher.status,
      });
      await fetchVouchers();
      setEditDialogOpen(false);
      setEditingVoucher(null);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật voucher");
    }
  };

  const handleCreateRandom = async () => {
    try {
      await axiosInstance.post("/api/voucher/create-random", {
        discountPercentage: Number(randomForm.discountPercentage),
        description: randomForm.description,
        expiryDate: randomForm.expiryDate,
        minOrderValue: Number(randomForm.minOrderValue),
        quantity: Number(randomForm.quantity) || 1,
      });
      await fetchVouchers();
      setCreateRandomDialogOpen(false);
      setRandomForm(defaultRandomForm);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể tạo voucher ngẫu nhiên");
    }
  };

  const handleOpenAssignDialog = () => {
    setAssignVoucherCode("");
    setAssignEmail("");
    setAssignUserId("");
    setAssignQuantity(1);
    setAssignMode("user");
    // Load users list nếu chưa có
    if (usersList.length === 0) {
      setUsersLoading(true);
      axiosInstance
        .get("/api/users")
        .then((res) => {
          const users = res.data?.data || res.data || [];
          setUsersList(Array.isArray(users) ? users : []);
        })
        .catch(() => {})
        .finally(() => setUsersLoading(false));
    }
    setAssignDialogOpen(true);
  };

  // Backend yêu cầu: { voucherId, userId, quantity } hoặc { voucherId, quantity }
  const handleAssignVoucher = async () => {
    if (!assignVoucherCode.trim()) return alert("Vui lòng nhập mã voucher");
    try {
      // Bước 1: lấy voucherId từ code
      const voucherRes = await axiosInstance.get(
        `/api/voucher/${assignVoucherCode.trim().toUpperCase()}`,
      );
      const voucherId = voucherRes.data?.data?._id || voucherRes.data?._id;
      if (!voucherId) return alert("Không tìm thấy voucher với mã này");

      const qty = Number(assignQuantity) || 1;

      if (assignMode === "all") {
        await axiosInstance.post("/api/voucher/assign-to-all", {
          voucherId,
          quantity: qty,
        });
        alert("Đã gán voucher cho tất cả người dùng!");
      } else {
        if (!assignUserId) return alert("Vui lòng chọn người dùng");
        await axiosInstance.post("/api/voucher/assign-to-user", {
          voucherId,
          userId: assignUserId,
          quantity: qty,
        });
        const found = usersList.find((u) => (u._id || u.id) === assignUserId);
        alert(
          `Đã gán voucher cho ${found?.email || found?.fullname || "người dùng"}!`,
        );
      }
      setAssignDialogOpen(false);
      setAssignUserId("");
      setAssignEmail("");
      setAssignVoucherCode("");
      setAssignQuantity(1);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể gán voucher");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Voucher Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenAssignDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Gán voucher
          </Button>
          <Button
            variant="outline"
            onClick={() => setCreateRandomDialogOpen(true)}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Tạo ngẫu nhiên
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo voucher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Tổng voucher",
            value: stats.total,
            icon: <Tag className="h-4 w-4" />,
            color: "",
          },
          {
            label: "Đang hoạt động",
            value: stats.active,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            color: "text-green-600",
          },
          {
            label: "Đã hết hạn",
            value: stats.expired,
            icon: <XCircle className="h-4 w-4 text-red-600" />,
            color: "text-red-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                {s.label}
                {s.icon}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500 mr-3" />
              <span className="text-muted-foreground">Đang tải voucher...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <AlertCircle className="h-10 w-10 mx-auto mb-3" />
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVouchers}
                className="mt-4"
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã voucher</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Đơn tối thiểu</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Không tìm thấy voucher nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded border border-pink-200">
                          {voucher.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-1">
                          {voucher.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-700">
                          {voucher.discountPercentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatPrice(voucher.minOrderValue)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(voucher.expiryDate)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleCopyCode(voucher.code)}
                            >
                              {copiedCode === voucher.code ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Đã copy!
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy mã
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingVoucher({ ...voucher });
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVoucher(voucher);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa voucher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredVouchers.length === 0
            ? "Không có kết quả"
            : `Hiển thị ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredVouchers.length)} trong ${filteredVouchers.length} voucher`}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Dialog: Tạo voucher ───────────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-pink-600" />
              Tạo voucher với mã tùy chỉnh
            </DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin để tạo voucher giảm giá mới.
            </DialogDescription>
          </DialogHeader>

          {submitResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${submitResult.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
            >
              {submitResult.success ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {submitResult.message}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">
                Mã voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="VD: WELCOME10"
                value={form.code}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
                className={`font-mono uppercase ${formErrors.code ? "border-red-400" : ""}`}
              />
              {formErrors.code && (
                <p className="text-xs text-red-500">{formErrors.code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Chỉ dùng chữ in hoa, số, dấu _ hoặc -
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pct">
                Phần trăm giảm giá (%) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pct"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="10"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    updateField("discountPercentage", e.target.value)
                  }
                  className={`pl-9 ${formErrors.discountPercentage ? "border-red-400" : ""}`}
                />
              </div>
              {formErrors.discountPercentage && (
                <p className="text-xs text-red-500">
                  {formErrors.discountPercentage}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">
                Mô tả <span className="text-red-500">*</span>
              </Label>
              <Input
                id="desc"
                placeholder="VD: Giảm 10% cho khách hàng mới"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={formErrors.description ? "border-red-400" : ""}
              />
              {formErrors.description && (
                <p className="text-xs text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiry">
                Ngày hết hạn <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expiry"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => updateField("expiryDate", e.target.value)}
                  className={`pl-9 ${formErrors.expiryDate ? "border-red-400" : ""}`}
                />
              </div>
              {formErrors.expiryDate && (
                <p className="text-xs text-red-500">{formErrors.expiryDate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minOrder">
                Giá trị đơn tối thiểu (VNĐ){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minOrder"
                  type="number"
                  min={0}
                  placeholder="200000"
                  value={form.minOrderValue}
                  onChange={(e) => updateField("minOrderValue", e.target.value)}
                  className={`pl-9 ${formErrors.minOrderValue ? "border-red-400" : ""}`}
                />
              </div>
              {formErrors.minOrderValue && (
                <p className="text-xs text-red-500">
                  {formErrors.minOrderValue}
                </p>
              )}
              {form.minOrderValue && !formErrors.minOrderValue && (
                <p className="text-xs text-muted-foreground">
                  = {formatPrice(Number(form.minOrderValue))}
                </p>
              )}
            </div>
          </div>

          {form.code && form.discountPercentage && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-pink-800 mb-1">Xem trước:</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-pink-700 bg-white border border-pink-300 px-2 py-0.5 rounded">
                  {form.code}
                </span>
                <span className="text-pink-700">
                  — Giảm {form.discountPercentage}%
                  {form.minOrderValue
                    ? ` cho đơn từ ${formatPrice(Number(form.minOrderValue))}`
                    : ""}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateVoucher}
              disabled={isSubmitting || submitResult?.success}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo voucher
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Xóa voucher ───────────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa voucher{" "}
              <span className="font-mono font-bold text-pink-700">
                {selectedVoucher?.code}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Chỉnh sửa voucher ─────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-pink-600" />
              Chỉnh sửa voucher
            </DialogTitle>
          </DialogHeader>
          {editingVoucher && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Mã voucher</Label>
                <Input
                  value={editingVoucher.code}
                  disabled
                  className="font-mono bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giảm giá (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editingVoucher.discountPercentage}
                  onChange={(e) =>
                    setEditingVoucher((p) => ({
                      ...p,
                      discountPercentage: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mô tả</Label>
                <Input
                  value={editingVoucher.description}
                  onChange={(e) =>
                    setEditingVoucher((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ngày hết hạn</Label>
                <Input
                  type="date"
                  value={editingVoucher.expiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditingVoucher((p) => ({
                      ...p,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingVoucher.minOrderValue}
                  onChange={(e) =>
                    setEditingVoucher((p) => ({
                      ...p,
                      minOrderValue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select
                  value={editingVoucher.status}
                  onValueChange={(v) =>
                    setEditingVoucher((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateVoucher}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Tạo voucher ngẫu nhiên ───────────────────────────────────── */}
      <Dialog
        open={createRandomDialogOpen}
        onOpenChange={setCreateRandomDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-pink-600" />
              Tạo voucher mã ngẫu nhiên
            </DialogTitle>
            <DialogDescription>
              Hệ thống sẽ tự động sinh mã voucher ngẫu nhiên.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Số lượng</Label>
              <Input
                type="number"
                min={1}
                value={randomForm.quantity}
                onChange={(e) =>
                  setRandomForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Giảm giá (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={randomForm.discountPercentage}
                onChange={(e) =>
                  setRandomForm((p) => ({
                    ...p,
                    discountPercentage: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input
                value={randomForm.description}
                onChange={(e) =>
                  setRandomForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={randomForm.expiryDate}
                onChange={(e) =>
                  setRandomForm((p) => ({ ...p, expiryDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                value={randomForm.minOrderValue}
                onChange={(e) =>
                  setRandomForm((p) => ({
                    ...p,
                    minOrderValue: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateRandomDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateRandom}>
              <Shuffle className="mr-2 h-4 w-4" />
              Tạo ngẫu nhiên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Gán voucher ───────────────────────────────────────────────── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-pink-600" />
              Gán voucher cho người dùng
            </DialogTitle>
            <DialogDescription>
              Nhập mã voucher và chọn đối tượng nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Mã voucher */}
            <div className="space-y-1.5">
              <Label>Mã voucher</Label>
              <Select
                value={assignVoucherCode}
                onValueChange={setAssignVoucherCode}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Chọn voucher..." />
                </SelectTrigger>
                <SelectContent>
                  {vouchers.map((v) => (
                    <SelectItem key={v.id} value={v.code}>
                      <span className="font-mono font-bold">{v.code}</span>
                      <span className="ml-2 text-muted-foreground text-xs">
                        — {v.discountPercentage}%
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Số lượng */}
            <div className="space-y-1.5">
              <Label>Số lượng</Label>
              <Input
                type="number"
                min={1}
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Gán cho */}
            <div className="space-y-1.5">
              <Label>Gán cho</Label>
              <Select
                value={assignMode}
                onValueChange={(v) => {
                  setAssignMode(v);
                  setAssignUserId("");
                  setAssignEmail("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Một người dùng</SelectItem>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chọn user cụ thể */}
            {assignMode === "user" && (
              <div className="space-y-1.5">
                <Label>Người dùng</Label>
                {usersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải danh sách...
                  </div>
                ) : usersList.length > 0 ? (
                  <>
                    {/* Search filter */}
                    <Input
                      placeholder="Tìm theo email hoặc tên..."
                      value={assignEmail}
                      onChange={(e) => {
                        setAssignEmail(e.target.value);
                        setAssignUserId("");
                      }}
                      className="mb-1"
                    />
                    <Select
                      value={assignUserId}
                      onValueChange={setAssignUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người dùng..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {usersList
                          .filter((u) => {
                            if (!assignEmail) return true;
                            const q = assignEmail.toLowerCase();
                            return (
                              u.email?.toLowerCase().includes(q) ||
                              u.fullname?.toLowerCase().includes(q) ||
                              u.fullName?.toLowerCase().includes(q)
                            );
                          })
                          .map((u) => (
                            <SelectItem
                              key={u._id || u.id}
                              value={u._id || u.id}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {u.fullname || u.fullName || u.name || "—"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {u.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {assignUserId && (
                      <p className="text-xs text-green-600">
                        ✓ Đã chọn:{" "}
                        {
                          usersList.find(
                            (u) => (u._id || u.id) === assignUserId,
                          )?.email
                        }
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-orange-500">
                    Không thể tải danh sách người dùng
                  </p>
                )}
              </div>
            )}

            {assignMode === "all" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                ⚠️ Voucher sẽ được gán cho <strong>tất cả người dùng</strong>{" "}
                trong hệ thống.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleAssignVoucher}>
              {assignMode === "all" ? (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Gán tất cả
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Gán voucher
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
