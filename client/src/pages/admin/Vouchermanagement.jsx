import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Tag,
  Search,
  Download,
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
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Mock voucher data ───────────────────────────────────────────────────────
const mockVouchers = [
  {
    id: 1,
    code: "WELCOME10",
    discountPercentage: 10,
    description: "Giảm 10% cho khách hàng mới",
    expiryDate: "2026-03-31",
    minOrderValue: 200000,
    status: "active",
    usageCount: 145,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "SUMMER20",
    discountPercentage: 20,
    description: "Khuyến mãi hè 2026",
    expiryDate: "2026-08-31",
    minOrderValue: 500000,
    status: "active",
    usageCount: 89,
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: 3,
    code: "FLASH15",
    discountPercentage: 15,
    description: "Flash sale cuối tuần",
    expiryDate: "2026-02-01",
    minOrderValue: 300000,
    status: "expired",
    usageCount: 312,
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: 4,
    code: "VIP30",
    discountPercentage: 30,
    description: "Ưu đãi khách hàng VIP",
    expiryDate: "2026-12-31",
    minOrderValue: 1000000,
    status: "active",
    usageCount: 23,
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: 5,
    code: "BABY5",
    discountPercentage: 5,
    description: "Giảm 5% cho đơn hàng sữa bột",
    expiryDate: "2026-04-30",
    minOrderValue: 150000,
    status: "inactive",
    usageCount: 0,
    createdAt: "2026-01-25T00:00:00Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

const statusConfig = {
  active: {
    label: "Đang hoạt động",
    color: "bg-green-100 text-green-800",
  },
  inactive: {
    label: "Tạm dừng",
    color: "bg-gray-100 text-gray-700",
  },
  expired: {
    label: "Hết hạn",
    color: "bg-red-100 text-red-800",
  },
};

// ─── Default form state ───────────────────────────────────────────────────────
const defaultForm = {
  code: "",
  discountPercentage: "",
  description: "",
  expiryDate: "",
  minOrderValue: "",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Form state
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { success, message }

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState(null);

  // ── Fetch vouchers from API ────────────────────────────────────────────────
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/voucher`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const voucherData = result.data || result.vouchers || result;

      // Map API data to match the expected format
      const mappedVouchers = (
        Array.isArray(voucherData) ? voucherData : []
      ).map((v) => ({
        id: v._id || v.id,
        code: v.code,
        discountPercentage: v.discountPercentage,
        description: v.description,
        expiryDate: v.expiryDate,
        minOrderValue: v.minOrderValue || 0,
        status: v.isActive ? "active" : "inactive",
        usageCount: v.usageCount || 0,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }));

      setVouchers(mappedVouchers);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchVouchers();
  }, []);

  // ── Filtered & paginated ──────────────────────────────────────────────────
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch =
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: vouchers.length,
    active: vouchers.filter((v) => {
      if (v.status !== "active") return false;
      if (!v.expiryDate) return true;
      return new Date(v.expiryDate) > new Date();
    }).length,
    expired: vouchers.filter((v) => {
      if (v.status === "inactive") return false;
      if (!v.expiryDate) return false;
      return new Date(v.expiryDate) <= new Date();
    }).length,
    totalUsage: vouchers.reduce((sum, v) => sum + (v.usageCount || 0), 0),
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};

    if (!form.code.trim()) {
      errors.code = "Mã voucher không được để trống";
    } else if (!/^[A-Z0-9_-]+$/.test(form.code.toUpperCase())) {
      errors.code = "Mã chỉ được chứa chữ in hoa, số, dấu _ hoặc -";
    } else if (
      vouchers.some((v) => v.code.toUpperCase() === form.code.toUpperCase())
    ) {
      errors.code = "Mã voucher này đã tồn tại";
    }

    const pct = Number(form.discountPercentage);
    if (!form.discountPercentage) {
      errors.discountPercentage = "Vui lòng nhập % giảm giá";
    } else if (isNaN(pct) || pct <= 0 || pct > 100) {
      errors.discountPercentage = "% giảm giá phải từ 1 đến 100";
    }

    if (!form.description.trim()) {
      errors.description = "Vui lòng nhập mô tả voucher";
    }

    if (!form.expiryDate) {
      errors.expiryDate = "Vui lòng chọn ngày hết hạn";
    } else if (new Date(form.expiryDate) <= new Date()) {
      errors.expiryDate = "Ngày hết hạn phải sau ngày hôm nay";
    }

    const minVal = Number(form.minOrderValue);
    if (!form.minOrderValue) {
      errors.minOrderValue = "Vui lòng nhập giá trị đơn tối thiểu";
    } else if (isNaN(minVal) || minVal < 0) {
      errors.minOrderValue = "Giá trị không hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Create voucher via API ────────────────────────────────────────────────
  const token = localStorage.getItem("accessToken");

  const handleCreateVoucher = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("accessToken");

    setIsSubmitting(true);
    setSubmitResult(null);

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountPercentage: Number(form.discountPercentage),
      description: form.description.trim(),
      expiryDate: form.expiryDate,
      minOrderValue: Number(form.minOrderValue),
    };

    try {
      const response = await fetch(`${API_BASE}/api/voucher/create-manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: `Voucher "${payload.code}" đã được tạo thành công!`,
        });

        // Refresh the voucher list
        await fetchVouchers();

        // Close dialog after 1.5s
        setTimeout(() => {
          setCreateDialogOpen(false);
          setForm(defaultForm);
          setSubmitResult(null);
        }, 1500);
      } else {
        setSubmitResult({
          success: false,
          message: result?.message || "Tạo voucher thất bại",
        });
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: "Lỗi kết nối server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete voucher ────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE}/api/voucher/${selectedVoucher.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Refresh the list
        await fetchVouchers();
        setDeleteDialogOpen(false);
        setSelectedVoucher(null);
      } else {
        const result = await response.json();
        alert(result?.message || "Không thể xóa voucher");
      }
    } catch (err) {
      console.error("Error deleting voucher:", err);
      alert("Lỗi kết nối server");
    }
  };

  // ── Copy code ─────────────────────────────────────────────────────────────
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ── Open create dialog (reset form) ──────────────────────────────────────
  const openCreateDialog = () => {
    setForm(defaultForm);
    setFormErrors({});
    setSubmitResult(null);
    setCreateDialogOpen(true);
  };

  // ── Field updater ─────────────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo voucher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Tổng voucher
              <Tag className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              Hết hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.expired}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 text-pink-500" />
              Tổng lượt dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.totalUsage.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm mã voucher hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Lọc trạng thái" />
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
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <p className="text-sm text-muted-foreground">
                  Đang tải voucher...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Không thể tải voucher
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchVouchers}>
                  Thử lại
                </Button>
              </div>
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
                  <TableHead>Đã dùng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      Không tìm thấy voucher nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVouchers.map((voucher) => {
                    // Determine actual status
                    let actualStatus = voucher.status;
                    if (
                      voucher.expiryDate &&
                      new Date(voucher.expiryDate) <= new Date()
                    ) {
                      actualStatus = "expired";
                    }
                    const config = statusConfig[actualStatus];

                    return (
                      <TableRow key={voucher.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded text-sm">
                              {voucher.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(voucher.code)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy mã"
                            >
                              {copiedCode === voucher.code ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{voucher.description}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-pink-600">
                            {voucher.discountPercentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatPrice(voucher.minOrderValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(voucher.expiryDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {voucher.usageCount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>{config.label}</Badge>
                        </TableCell>
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
                                <Copy className="mr-2 h-4 w-4" />
                                Copy mã
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị{" "}
          {Math.min(
            (currentPage - 1) * itemsPerPage + 1,
            filteredVouchers.length,
          )}{" "}
          đến {Math.min(currentPage * itemsPerPage, filteredVouchers.length)}{" "}
          trong tổng số {filteredVouchers.length} voucher
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

      {/* ── Create Voucher Dialog ─────────────────────────────────────────── */}
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

          {/* Success / Error banner */}
          {submitResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                submitResult.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
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
            {/* Code */}
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
                className={`font-mono uppercase ${formErrors.code ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {formErrors.code && (
                <p className="text-xs text-red-500">{formErrors.code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Chỉ dùng chữ in hoa, số, dấu _ hoặc -
              </p>
            </div>

            {/* Discount percentage */}
            <div className="space-y-1.5">
              <Label htmlFor="discountPercentage">
                Phần trăm giảm giá (%) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discountPercentage"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="10"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    updateField("discountPercentage", e.target.value)
                  }
                  className={`pl-9 ${formErrors.discountPercentage ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {formErrors.discountPercentage && (
                <p className="text-xs text-red-500">
                  {formErrors.discountPercentage}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Mô tả <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                placeholder="VD: Giảm 10% cho khách hàng mới"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={
                  formErrors.description
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {formErrors.description && (
                <p className="text-xs text-red-500">{formErrors.description}</p>
              )}
            </div>

            {/* Expiry date */}
            <div className="space-y-1.5">
              <Label htmlFor="expiryDate">
                Ngày hết hạn <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => updateField("expiryDate", e.target.value)}
                  className={`pl-9 ${formErrors.expiryDate ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {formErrors.expiryDate && (
                <p className="text-xs text-red-500">{formErrors.expiryDate}</p>
              )}
            </div>

            {/* Min order value */}
            <div className="space-y-1.5">
              <Label htmlFor="minOrderValue">
                Giá trị đơn hàng tối thiểu (VNĐ){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minOrderValue"
                  type="number"
                  min={0}
                  placeholder="200000"
                  value={form.minOrderValue}
                  onChange={(e) => updateField("minOrderValue", e.target.value)}
                  className={`pl-9 ${formErrors.minOrderValue ? "border-red-400 focus-visible:ring-red-400" : ""}`}
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

          {/* Preview */}
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

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
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
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
