import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Activity,
  Users,
  ShoppingCart,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
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

// Mock system logs data
const mockSystemLogs = [
  {
    id: 1,
    type: "info",
    category: "user",
    action: "user_login",
    description: "Nguyễn Văn An đã đăng nhập hệ thống",
    user: "Nguyễn Văn An",
    ip: "192.168.1.100",
    timestamp: "2026-01-28T08:30:15Z",
  },
  {
    id: 2,
    type: "success",
    category: "order",
    action: "order_created",
    description: "Đơn hàng ORD-2026-156 được tạo thành công",
    user: "Trần Thị Bình",
    ip: "192.168.1.102",
    timestamp: "2026-01-28T08:25:42Z",
  },
  {
    id: 3,
    type: "warning",
    category: "inventory",
    action: "low_stock",
    description: "Cảnh báo: Similac Gain Plus 900g sắp hết hàng (còn 3)",
    user: "System",
    ip: "127.0.0.1",
    timestamp: "2026-01-28T08:20:00Z",
  },
  {
    id: 4,
    type: "error",
    category: "payment",
    action: "payment_failed",
    description: "Thanh toán đơn hàng ORD-2026-145 thất bại",
    user: "Lê Văn Cường",
    ip: "192.168.1.105",
    timestamp: "2026-01-28T08:15:30Z",
  },
  {
    id: 5,
    type: "success",
    category: "product",
    action: "product_updated",
    description: "Cập nhật thông tin sản phẩm: Enfamil A+ 400g",
    user: "Phạm Thị Dung",
    ip: "192.168.1.103",
    timestamp: "2026-01-28T08:10:12Z",
  },
  {
    id: 6,
    type: "info",
    category: "settings",
    action: "settings_changed",
    description: "Cài đặt hệ thống được cập nhật",
    user: "Admin",
    ip: "192.168.1.101",
    timestamp: "2026-01-28T08:05:45Z",
  },
  {
    id: 7,
    type: "success",
    category: "user",
    action: "user_created",
    description: "Tài khoản mới được tạo: hoang.van.em@email.com",
    user: "System",
    ip: "127.0.0.1",
    timestamp: "2026-01-28T07:58:20Z",
  },
  {
    id: 8,
    type: "error",
    category: "order",
    action: "order_cancelled",
    description: "Đơn hàng ORD-2026-143 bị hủy do hết hàng",
    user: "Trần Thị Bình",
    ip: "192.168.1.102",
    timestamp: "2026-01-28T07:50:33Z",
  },
];

const logTypeConfig = {
  info: {
    icon: Info,
    color: "bg-blue-100 text-blue-800",
    label: "Info",
  },
  success: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    label: "Success",
  },
  warning: {
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-800",
    label: "Warning",
  },
  error: {
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    label: "Error",
  },
};

const categoryConfig = {
  user: { icon: Users, label: "User" },
  order: { icon: ShoppingCart, label: "Order" },
  product: { icon: Package, label: "Product" },
  inventory: { icon: Package, label: "Inventory" },
  payment: { icon: Activity, label: "Payment" },
  settings: { icon: Settings, label: "Settings" },
};

const formatDateTime = (dateString) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
};

export default function SystemReports() {
  const [logs, setLogs] = useState(mockSystemLogs);
  const [logsLoading, setLogsLoading] = useState(false);

  // Try to fetch real logs from API; fall back to mock data if not available
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await axiosInstance.get("/api/logs");
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      } catch (err) {
        // API not available yet — keep mock data
        console.info("Logs API not available, using mock data.");
      } finally {
        setLogsLoading(false);
      }
    };
    fetchLogs();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || log.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || log.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [logs, searchQuery, typeFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const stats = {
    total: logs.length,
    info: logs.filter((l) => l.type === "info").length,
    success: logs.filter((l) => l.type === "success").length,
    warning: logs.filter((l) => l.type === "warning").length,
    error: logs.filter((l) => l.type === "error").length,
  };

  const handleExport = () => {
    console.log("Exporting system logs...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi hoạt động và logs hệ thống
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-600" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.info}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => {
                const typeConfig = logTypeConfig[log.type];
                const catConfig = categoryConfig[log.category];
                const TypeIcon = typeConfig.icon;
                const CategoryIcon = catConfig.icon;

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={typeConfig.color}>
                        <TypeIcon className="mr-1 h-3 w-3" />
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{catConfig.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Action: {log.action}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.user}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {log.ip}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
          {Math.min(currentPage * itemsPerPage, filteredLogs.length)} trong tổng
          số {filteredLogs.length} logs
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
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
