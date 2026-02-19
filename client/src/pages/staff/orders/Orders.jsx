import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  ClockIcon,
  Truck,
  Package,
  XCircle,
  InfoIcon,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import OrderDetailDialog from "./components/OrderDetailDialog";
import {
  getAllOrders,
  updateOrderStatus,
  formatOrderNumber,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPaymentMethodLabel,
  getItemStatusLabel,
  formatVND,
} from "../orders/services/orderService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Format helpers
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getOrderStatusIcon = (status) => {
  const iconMap = {
    pending_payment: <CreditCard className="w-4 h-4" />,
    processing: <ClockIcon className="w-4 h-4" />,
    shipped: <Truck className="w-4 h-4" />,
    delivered: <Package className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
    partially_shipped: <AlertCircle className="w-4 h-4" />,
  };
  return iconMap[status] || <InfoIcon className="w-4 h-4" />;
};

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [hasPreOrderFilter, setHasPreOrderFilter] = useState("all");
  const [dateRangeType, setDateRangeType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const pageSize = 20;

  // Update status filter when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1);
    
    const tabToStatusMap = {
      all: "all",
      pending: "pending_payment",
      processing: "processing",
      ready: "processing", // Could be used for ready to ship
      shipping: "shipped",
      delivered: "delivered",
      cancelled: "cancelled",
      returned: "cancelled", // Could be separated if you add a return status
      failed: "cancelled",
    };
    
    setStatusFilter(tabToStatusMap[value] || "all");
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (paymentStatusFilter !== "all")
        filters.paymentStatus = paymentStatusFilter;
      if (paymentFilter !== "all") filters.paymentMethod = paymentFilter;
      if (hasPreOrderFilter !== "all")
        filters.hasPreOrder = hasPreOrderFilter === "yes";
      if (search) filters.search = search;

      const data = await getAllOrders(filters);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter, paymentFilter, hasPreOrderFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchOrders();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter and paginate orders (client-side filtering for date/price)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Date range filter (client-side)
    if (dateRangeType === "custom" && startDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        return orderDate >= start;
      });
    }
    if (dateRangeType === "custom" && endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      });
    }

    // Price range filter (client-side)
    if (minPrice) {
      filtered = filtered.filter(
        (order) => order.totalAmount >= parseFloat(minPrice),
      );
    }
    if (maxPrice) {
      filtered = filtered.filter(
        (order) => order.totalAmount <= parseFloat(maxPrice),
      );
    }

    return filtered;
  }, [orders, dateRangeType, startDate, endDate, minPrice, maxPrice]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, page]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success('Đã cập nhật trạng thái đơn hàng');
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error(err.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handlePrintInvoice = (order) => {
    // Open print preview in new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra trình chặn popup.');
      return;
    }

    // Import React and ReactDOM for rendering
    import('react-dom/client').then(({ createRoot }) => {
      import('./components/PrintInvoice').then(({ default: PrintInvoice }) => {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Hóa đơn - ${order.orderNumber}</title>
            </head>
            <body>
              <div id="print-root"></div>
            </body>
          </html>
        `);
        printWindow.document.close();

        const React = require('react');
        const root = createRoot(printWindow.document.getElementById('print-root'));
        root.render(React.createElement(PrintInvoice, { order }));
      });
    });
  };

  const handlePrintPackingSlip = (order) => {
    // Open print preview in new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra trình chặn popup.');
      return;
    }

    // Import React and ReactDOM for rendering
    import('react-dom/client').then(({ createRoot }) => {
      import('./components/PrintPackingSlip').then(({ default: PrintPackingSlip }) => {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Phiếu đóng gói - ${order.orderNumber}</title>
            </head>
            <body>
              <div id="print-root"></div>
            </body>
          </html>
        `);
        printWindow.document.close();

        const React = require('react');
        const root = createRoot(printWindow.document.getElementById('print-root'));
        root.render(React.createElement(PrintPackingSlip, { order }));
      });
    });
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setPaymentFilter("all");
    setHasPreOrderFilter("all");
    setDateRangeType("all");
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  return (
    <>
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="pt-2 pb-6">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Quản lý đơn hàng
            </h1>
          </div>
          <div className="sticky top-20 bg-white border rounded-lg shadow-xs p-4 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div>
              <h3 className="font-semibold text-sm mb-3">Bộ lọc</h3>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trạng thái đơn hàng</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending_payment">
                      Chờ thanh toán
                    </SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipped">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="partially_shipped">
                      Giao một phần
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trạng thái thanh toán
              </Label>
              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                    <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Phương thức thanh toán
              </Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="cod">Tiền mặt (COD)</SelectItem>
                    <SelectItem value="vnpay">VNPay</SelectItem>
                    <SelectItem value="momo">MoMo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Pre-order Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Đơn đặt trước</Label>
              <Select
                value={hasPreOrderFilter}
                onValueChange={setHasPreOrderFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="yes">Có đặt trước</SelectItem>
                    <SelectItem value="no">Không đặt trước</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Thời gian tạo</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    value="all"
                    checked={dateRangeType === "all"}
                    onChange={(e) => setDateRangeType(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Toàn thời gian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    value="custom"
                    checked={dateRangeType === "custom"}
                    onChange={(e) => setDateRangeType(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Tùy chỉnh</span>
                </label>
                {dateRangeType === "custom" && (
                  <div className="ml-6 space-y-2 mt-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-sm"
                      placeholder="Từ ngày"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-sm"
                      placeholder="Đến ngày"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Khoảng giá</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Giá tối đa"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="pt-2 flex-1 space-y-5">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ thanh toán</TabsTrigger>
              <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
              <TabsTrigger value="shipping">Đang giao</TabsTrigger>
              <TabsTrigger value="delivered">Đã giao</TabsTrigger>
              <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
            <TabsContent value="processing" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
            <TabsContent value="shipping" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
            <TabsContent value="delivered" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
            <TabsContent value="cancelled" className="mt-0">
              {/* Content will be shown below */}
            </TabsContent>
          </Tabs>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Orders Table */}
          <Card className="py-2 max-h-[calc(100vh-10rem)]">
            <CardContent className="px-3">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {/* Table header skeleton */}
                    <div className="flex gap-4 px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                  </div>
                  {/* Table rows skeleton */}
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex gap-4 px-4 py-4 border-t">
                        <Skeleton className="h-4 w-28" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-24 ml-4" />
                        <Skeleton className="h-8 w-28 ml-4" />
                        <Skeleton className="h-4 w-32 ml-4" />
                        <div className="flex gap-2 ml-auto">
                          <Skeleton className="h-9 w-28" />
                          <Skeleton className="h-9 w-16" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  {/* Pagination */}
                  <div className="flex items-center justify-end gap-4 px-2 pt-1 pb-3 border-b">
                    <p className="text-sm text-muted-foreground">
                      Trang {page} / {totalPages || 1} ({filteredOrders.length}{" "}
                      đơn hàng)
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
                          setPage((p) => Math.min(totalPages || 1, p + 1))
                        }
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="w-full h-[calc(100vh-14rem)]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow className="hover:bg-white">
                          <TableHead>Mã đơn</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Tổng tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thanh toán</TableHead>
                          <TableHead>Ngày đặt</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOrders.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Không có đơn hàng nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedOrders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">
                                {formatOrderNumber(order)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {order.customer?.fullname || "N/A"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.phone || order.customer?.phone || "N/A"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatVND(order.totalAmount)}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={order.orderStatus}
                                  onValueChange={(value) =>
                                    handleUpdateStatus(order._id, value)
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue>
                                      <Badge
                                        className={getOrderStatusColor(
                                          order.orderStatus,
                                        )}
                                      >
                                        {getOrderStatusIcon(order.orderStatus)}
                                        {getOrderStatusLabel(order.orderStatus)}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="pending_payment">
                                        Chờ thanh toán
                                      </SelectItem>
                                      <SelectItem value="processing">
                                        Đang xử lý
                                      </SelectItem>
                                      <SelectItem value="shipped">
                                        Đang giao
                                      </SelectItem>
                                      <SelectItem value="delivered">
                                        Đã giao
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        Đã hủy
                                      </SelectItem>
                                      <SelectItem value="partially_shipped">
                                        Giao một phần
                                      </SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getPaymentStatusColor(
                                    order.paymentStatus,
                                  )}
                                >
                                  {getPaymentStatusLabel(order.paymentStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDateTime(order.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Xem
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePrintInvoice(order)}
                                  >
                                    <Printer className="h-4 w-4" />
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

          {/* Order Detail Dialog */}
          <OrderDetailDialog
            selectedOrder={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            internalNote={internalNote}
            setInternalNote={setInternalNote}
            onPrintInvoice={handlePrintInvoice}
            onPrintPackingSlip={handlePrintPackingSlip}
            onOrderUpdated={fetchOrders}
          />
        </div>
      </div>
    </>
  );
}
