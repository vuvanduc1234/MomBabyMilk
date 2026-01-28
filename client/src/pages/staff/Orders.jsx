import { useState, useMemo } from "react";
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Flag,
  Printer,
  FileText,
  ClockIcon,
  CheckCircle,
  Truck,
  Package,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const mockOrders = [
  {
    id: "1",
    order_number: "ORD-2026-001",
    customer_name: "Nguyễn Thị Lan",
    customer_phone: "0901234567",
    customer_email: "lan.nguyen@email.com",
    shipping_address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    total: 12450000,
    subtotal: 12450000,
    shipping_fee: 0,
    discount: 0,
    status: "pending",
    payment_method: "cod",
    created_at: "2026-01-28T08:30:00Z",
    notes: "Giao hàng giờ hành chính",
    order_items: [
      {
        id: "1",
        product_name: "Similac Gain Plus 900g",
        quantity: 2,
        product_price: 625000,
      },
      {
        id: "1a",
        product_name: "Enfamil A+ 400g",
        quantity: 3,
        product_price: 450000,
      },
      {
        id: "1b",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 1,
        product_price: 850000,
      },
      {
        id: "1c",
        product_name: "Meiji Infant Formula 800g",
        quantity: 2,
        product_price: 650000,
      },
      {
        id: "1d",
        product_name: "Aptamil Essensis 800g",
        quantity: 1,
        product_price: 470000,
      },
      {
        id: "1e",
        product_name: "Abbott PediaSure Vanilla 900g",
        quantity: 1,
        product_price: 550000,
      },
      {
        id: "1f",
        product_name: "Similac Ready-to-Feed 180ml",
        quantity: 6,
        product_price: 35000,
      },
      {
        id: "1g",
        product_name: "Enfamil A+ Liquid 946ml",
        quantity: 1,
        product_price: 175000,
      },
      {
        id: "1h",
        product_name: "Meiji Growing Up 1-3 Years 800g",
        quantity: 1,
        product_price: 580000,
      },
      {
        id: "1i",
        product_name: "Similac Total Comfort 820g",
        quantity: 2,
        product_price: 490000,
      },
      {
        id: "1j",
        product_name: "Aptamil Gold+ Stage 1",
        quantity: 2,
        product_price: 459000,
      },
      {
        id: "1k",
        product_name: "Enfamil Premium 900g",
        quantity: 1,
        product_price: 520000,
      },
      {
        id: "1l",
        product_name: "Abbott Similac Mom 900g",
        quantity: 1,
        product_price: 380000,
      },
      {
        id: "1m",
        product_name: "Meiji HP 850g",
        quantity: 1,
        product_price: 690000,
      },
      {
        id: "1n",
        product_name: "Aptamil Pronutra 800g",
        quantity: 2,
        product_price: 510000,
      },
      {
        id: "1o",
        product_name: "Similac Neosure 370g",
        quantity: 1,
        product_price: 420000,
      },
      {
        id: "1p",
        product_name: "Enfamil Gentlease 560g",
        quantity: 2,
        product_price: 485000,
      },
      {
        id: "1q",
        product_name: "Abbott Ensure Gold 850g",
        quantity: 1,
        product_price: 620000,
      },
      {
        id: "1r",
        product_name: "Meiji Thanh 800g",
        quantity: 1,
        product_price: 570000,
      },
      {
        id: "1s",
        product_name: "Aptamil Profutura 900g",
        quantity: 1,
        product_price: 780000,
      },
      {
        id: "1t",
        product_name: "Similac Eye-Q Plus 900g",
        quantity: 2,
        product_price: 640000,
      },
      {
        id: "1u",
        product_name: "Enfamil NeuroPro 610g",
        quantity: 1,
        product_price: 550000,
      },
      {
        id: "1v",
        product_name: "Abbott Glucerna 400g",
        quantity: 1,
        product_price: 320000,
      },
      {
        id: "1w",
        product_name: "Meiji Step 820g",
        quantity: 2,
        product_price: 590000,
      },
      {
        id: "1x",
        product_name: "Aptamil Pre 800g",
        quantity: 1,
        product_price: 530000,
      },
      {
        id: "1y",
        product_name: "Similac Go & Grow 680g",
        quantity: 1,
        product_price: 480000,
      },
      {
        id: "1z",
        product_name: "Enfamil AR 400g",
        quantity: 1,
        product_price: 395000,
      },
      {
        id: "1aa",
        product_name: "Abbott Pediasure Grow & Gain 900g",
        quantity: 1,
        product_price: 610000,
      },
      {
        id: "1ab",
        product_name: "Meiji Infant Formula Powder 800g",
        quantity: 1,
        product_price: 655000,
      },
      {
        id: "1ac",
        product_name: "Aptamil Advanced 1 900g",
        quantity: 1,
        product_price: 720000,
      },
    ],
  },
  {
    id: "2",
    order_number: "ORD-2026-002",
    customer_name: "Trần Văn Minh",
    customer_phone: "0912345678",
    customer_email: "minh.tran@email.com",
    shipping_address: "456 Lê Văn Việt, Quận 9, TP.HCM",
    total: 890000,
    subtotal: 920000,
    shipping_fee: 30000,
    discount: 60000,
    status: "confirmed",
    payment_method: "banking",
    created_at: "2026-01-28T09:15:00Z",
    notes: "",
    order_items: [
      {
        id: "2",
        product_name: "Enfamil A+ 400g",
        quantity: 1,
        product_price: 450000,
      },
      {
        id: "3",
        product_name: "Aptamil Essensis 800g",
        quantity: 1,
        product_price: 470000,
      },
    ],
  },
  {
    id: "3",
    order_number: "ORD-2026-003",
    customer_name: "Lê Thị Hương",
    customer_phone: "0923456789",
    customer_email: "huong.le@email.com",
    shipping_address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    total: 2150000,
    subtotal: 2150000,
    shipping_fee: 0,
    discount: 0,
    status: "shipping",
    payment_method: "cod",
    created_at: "2026-01-28T10:00:00Z",
    notes: "Gọi trước khi giao 30 phút",
    order_items: [
      {
        id: "4",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 1,
        product_price: 850000,
      },
      {
        id: "5",
        product_name: "Meiji Infant Formula 800g",
        quantity: 2,
        product_price: 650000,
      },
    ],
  },
  {
    id: "4",
    order_number: "ORD-2026-004",
    customer_name: "Phạm Quốc Anh",
    customer_phone: "0934567890",
    customer_email: "anh.pham@email.com",
    shipping_address: "321 Đinh Tiên Hoàng, Quận 1, TP.HCM",
    total: 650000,
    subtotal: 650000,
    shipping_fee: 0,
    discount: 0,
    status: "delivered",
    payment_method: "banking",
    created_at: "2026-01-27T14:20:00Z",
    notes: "",
    order_items: [
      {
        id: "6",
        product_name: "Similac Gain Plus 900g",
        quantity: 1,
        product_price: 650000,
      },
    ],
  },
  {
    id: "5",
    order_number: "ORD-2026-005",
    customer_name: "Hoàng Thị Mai",
    customer_phone: "0945678901",
    customer_email: "mai.hoang@email.com",
    shipping_address: "654 Trường Chinh, Tân Bình, TP.HCM",
    total: 1780000,
    subtotal: 1850000,
    shipping_fee: 30000,
    discount: 100000,
    status: "pending",
    payment_method: "cod",
    created_at: "2026-01-28T11:20:00Z",
    notes: "Khách hàng VIP",
    order_items: [
      {
        id: "7",
        product_name: "Enfamil A+ 400g",
        quantity: 2,
        product_price: 450000,
      },
      {
        id: "8",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 1,
        product_price: 850000,
      },
    ],
  },
  {
    id: "6",
    order_number: "ORD-2026-006",
    customer_name: "Đỗ Văn Tuấn",
    customer_phone: "0956789012",
    customer_email: "tuan.do@email.com",
    shipping_address: "147 Cách Mạng Tháng 8, Quận 3, TP.HCM",
    total: 1420000,
    subtotal: 1420000,
    shipping_fee: 0,
    discount: 0,
    status: "confirmed",
    payment_method: "momo",
    created_at: "2026-01-28T07:45:00Z",
    notes: "",
    order_items: [
      {
        id: "9",
        product_name: "Aptamil Essensis 800g",
        quantity: 3,
        product_price: 470000,
      },
    ],
  },
  {
    id: "7",
    order_number: "ORD-2026-007",
    customer_name: "Vũ Thị Thu",
    customer_phone: "0967890123",
    customer_email: "thu.vu@email.com",
    shipping_address: "258 Lý Thường Kiệt, Quận 10, TP.HCM",
    total: 980000,
    subtotal: 980000,
    shipping_fee: 30000,
    discount: 30000,
    status: "shipping",
    payment_method: "cod",
    created_at: "2026-01-27T16:30:00Z",
    notes: "",
    order_items: [
      {
        id: "10",
        product_name: "Meiji Infant Formula 800g",
        quantity: 1,
        product_price: 650000,
      },
      {
        id: "11",
        product_name: "Similac Gain Plus 900g",
        quantity: 1,
        product_price: 330000,
      },
    ],
  },
  {
    id: "8",
    order_number: "ORD-2026-008",
    customer_name: "Bùi Minh Khoa",
    customer_phone: "0978901234",
    customer_email: "khoa.bui@email.com",
    shipping_address: "369 Phan Văn Trị, Gò Vấp, TP.HCM",
    total: 2890000,
    subtotal: 2890000,
    shipping_fee: 0,
    discount: 0,
    status: "cancelled",
    payment_method: "banking",
    created_at: "2026-01-27T12:00:00Z",
    notes: "Khách hàng yêu cầu hủy",
    order_items: [
      {
        id: "12",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 2,
        product_price: 850000,
      },
      {
        id: "13",
        product_name: "Enfamil A+ 400g",
        quantity: 3,
        product_price: 450000,
      },
    ],
  },
  {
    id: "9",
    order_number: "ORD-2026-009",
    customer_name: "Trương Thị Hà",
    customer_phone: "0989012345",
    customer_email: "ha.truong@email.com",
    shipping_address: "741 Lê Hồng Phong, Quận 10, TP.HCM",
    total: 1580000,
    subtotal: 1580000,
    shipping_fee: 30000,
    discount: 30000,
    status: "pending",
    payment_method: "cod",
    created_at: "2026-01-28T12:00:00Z",
    notes: "Giao buổi chiều",
    order_items: [
      {
        id: "14",
        product_name: "Similac Gain Plus 900g",
        quantity: 1,
        product_price: 625000,
      },
      {
        id: "15",
        product_name: "Aptamil Essensis 800g",
        quantity: 2,
        product_price: 470000,
      },
    ],
  },
  {
    id: "10",
    order_number: "ORD-2026-010",
    customer_name: "Ngô Văn Thắng",
    customer_phone: "0990123456",
    customer_email: "thang.ngo@email.com",
    shipping_address: "852 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    total: 3250000,
    subtotal: 3250000,
    shipping_fee: 0,
    discount: 0,
    status: "confirmed",
    payment_method: "vnpay",
    created_at: "2026-01-28T06:15:00Z",
    notes: "",
    order_items: [
      {
        id: "16",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 2,
        product_price: 850000,
      },
      {
        id: "17",
        product_name: "Meiji Infant Formula 800g",
        quantity: 2,
        product_price: 650000,
      },
      {
        id: "18",
        product_name: "Enfamil A+ 400g",
        quantity: 1,
        product_price: 450000,
      },
    ],
  },
  {
    id: "11",
    order_number: "ORD-2026-011",
    customer_name: "Đinh Thị Xuân",
    customer_phone: "0901234568",
    customer_email: "xuan.dinh@email.com",
    shipping_address: "963 Tôn Đức Thắng, Quận 1, TP.HCM",
    total: 720000,
    subtotal: 750000,
    shipping_fee: 0,
    discount: 30000,
    status: "shipping",
    payment_method: "momo",
    created_at: "2026-01-27T18:30:00Z",
    notes: "Giao tận tay người nhận",
    order_items: [
      {
        id: "19",
        product_name: "Similac Ready-to-Feed 180ml",
        quantity: 12,
        product_price: 35000,
      },
      {
        id: "20",
        product_name: "Enfamil A+ Liquid 946ml",
        quantity: 2,
        product_price: 175000,
      },
    ],
  },
  {
    id: "12",
    order_number: "ORD-2026-012",
    customer_name: "Lý Minh Tuấn",
    customer_phone: "0912345679",
    customer_email: "tuan.ly@email.com",
    shipping_address: "159 Hoàng Văn Thụ, Phú Nhuận, TP.HCM",
    total: 1890000,
    subtotal: 1890000,
    shipping_fee: 0,
    discount: 0,
    status: "delivered",
    payment_method: "banking",
    created_at: "2026-01-26T10:20:00Z",
    notes: "",
    order_items: [
      {
        id: "21",
        product_name: "Abbott PediaSure Vanilla 900g",
        quantity: 2,
        product_price: 550000,
      },
      {
        id: "22",
        product_name: "Meiji Growing Up 1-3 Years 800g",
        quantity: 1,
        product_price: 580000,
      },
    ],
  },
  {
    id: "13",
    order_number: "ORD-2026-013",
    customer_name: "Cao Thị Bích",
    customer_phone: "0923456780",
    customer_email: "bich.cao@email.com",
    shipping_address: "357 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    total: 4120000,
    subtotal: 4250000,
    shipping_fee: 30000,
    discount: 160000,
    status: "pending",
    payment_method: "cod",
    created_at: "2026-01-28T13:45:00Z",
    notes: "Khách hàng thân thiết, ưu tiên giao",
    order_items: [
      {
        id: "23",
        product_name: "Similac Gain Plus 900g",
        quantity: 3,
        product_price: 625000,
      },
      {
        id: "24",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 2,
        product_price: 850000,
      },
      {
        id: "25",
        product_name: "Aptamil Essensis 800g",
        quantity: 2,
        product_price: 470000,
      },
    ],
  },
  {
    id: "14",
    order_number: "ORD-2026-014",
    customer_name: "Hồ Văn Nam",
    customer_phone: "0934567891",
    customer_email: "nam.ho@email.com",
    shipping_address: "456 Ba Tháng Hai, Quận 10, TP.HCM",
    total: 1340000,
    subtotal: 1340000,
    shipping_fee: 0,
    discount: 0,
    status: "confirmed",
    payment_method: "banking",
    created_at: "2026-01-28T05:30:00Z",
    notes: "",
    order_items: [
      {
        id: "26",
        product_name: "Meiji Infant Formula 800g",
        quantity: 2,
        product_price: 650000,
      },
    ],
  },
  {
    id: "15",
    order_number: "ORD-2026-015",
    customer_name: "Phan Thị Ngọc",
    customer_phone: "0945678902",
    customer_email: "ngoc.phan@email.com",
    shipping_address: "789 Lý Thái Tổ, Quận 3, TP.HCM",
    total: 2680000,
    subtotal: 2780000,
    shipping_fee: 0,
    discount: 100000,
    status: "shipping",
    payment_method: "momo",
    created_at: "2026-01-27T15:00:00Z",
    notes: "Kiểm tra hàng trước khi thanh toán",
    order_items: [
      {
        id: "27",
        product_name: "Enfamil A+ 400g",
        quantity: 4,
        product_price: 450000,
      },
      {
        id: "28",
        product_name: "Abbott Grow Gold 1.7kg",
        quantity: 1,
        product_price: 850000,
      },
    ],
  },
];

// Format helpers
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

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

const getOrderStatusText = (status) => {
  const statusMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    shipping: "bg-purple-100 text-purple-800 border-purple-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[status] || "";
};

const getOrderStatusIcon = (status) => {
  const iconMap = {
    pending: <ClockIcon data-icon="inline-start" />,
    confirmed: <CheckCircle data-icon="inline-start" />,
    shipping: <Truck data-icon="inline-start" />,
    delivered: <Package data-icon="inline-start" />,
    cancelled: <XCircle data-icon="inline-start" />,
  };
  return iconMap[status] || "InfoIcon";
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    cod: "Tiền mặt (COD)",
    banking: "Chuyển khoản",
    momo: "MoMo",
    vnpay: "VNPay",
  };
  return methodMap[method] || method;
};

export default function StaffOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isLoading] = useState(false);
  const pageSize = 20;

  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.customer_phone.includes(searchLower),
      );
    }

    return filtered;
  }, [orders, statusFilter, search]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, page]);

  const updateStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    // Simulate toast
    console.log("Đã cập nhật trạng thái đơn hàng");
  };

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const handlePrintInvoice = (order) => {
    console.log("In hóa đơn cho đơn hàng:", order.order_number);
  };

  const handlePrintPackingSlip = (order) => {
    console.log("In phiếu đóng gói cho đơn hàng:", order.order_number);
  };

  return (
    <div className="space-y-6">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Quản lý đơn hàng
        </h1>
        <p className="text-muted-foreground">
          Xử lý và theo dõi đơn hàng khách hàng
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} >
          <SelectTrigger className="w-full sm:w-48 bg-card">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="shipping">Đang giao</SelectItem>
              <SelectItem value="delivered">Đã giao</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="py-2">
        <CardContent className="px-3">
          {isLoading ? (
            <div className="py-2 space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white">
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateStatus(order.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <Badge
                                className={getOrderStatusColor(order.status)}
                              >
                                {getOrderStatusIcon(order.status)}
                                {getOrderStatusText(order.status)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="pending">
                                Chờ xác nhận
                              </SelectItem>
                              <SelectItem value="confirmed">
                                Đã xác nhận
                              </SelectItem>
                              <SelectItem value="shipping">
                                Đang giao
                              </SelectItem>
                              <SelectItem value="delivered">Đã giao</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handlePrintInvoice(order)}
                          >
                            <Printer className="h-4 w-4" />
                            In
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Trang {page} / {totalPages} ({filteredOrders.length} đơn hàng)
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto lg:overflow-y-clip scrollbar-thin sm:mx-4">
          <DialogHeader>
            <DialogTitle>
              Chi tiết đơn hàng #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-6 flex flex-col lg:justify-between">
                {/* Customer Infos */}
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 border-b pb-6">
                    <div>
                      <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                      <p>{selectedOrder.customer_name}</p>
                      <p className="text-muted-foreground">
                        {selectedOrder.customer_phone}
                      </p>
                      {selectedOrder.customer_email && (
                        <p className="text-muted-foreground">
                          {selectedOrder.customer_email}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                      <p className="text-muted-foreground">
                        {selectedOrder.shipping_address}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Ghi chú khách hàng</h4>
                      <p className="text-muted-foreground">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Staff Actions */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Thao tác nhân viên</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tracking">Mã vận đơn</Label>
                      <Input
                        id="tracking"
                        placeholder="Nhập mã vận đơn..."
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Ghi chú nội bộ</Label>
                      <Textarea
                        id="note"
                        placeholder="Ghi chú nội bộ..."
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-row flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintInvoice(selectedOrder)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      In hóa đơn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintPackingSlip(selectedOrder)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      In phiếu đóng gói
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-600 border-amber-300"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Đánh dấu có vấn đề
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Staff không thể chỉnh sửa giá, thanh toán hoặc hoàn tiền.
                    Liên hệ Admin nếu cần.
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <h4 className="font-medium lg:mb-2">Sản phẩm</h4>
                  <div className="space-y-2 overflow-y-auto lg:max-h-110 scrollbar-thin -mr-2 pr-2">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-2 border-b"
                      >
                        <span>
                          {item.product_name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.product_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>
                      {selectedOrder.shipping_fee === 0
                        ? "Miễn phí"
                        : formatPrice(selectedOrder.shipping_fee)}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Tổng cộng</span>
                    <span className="text-primary">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                  <div className="flex items-end flex-col text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Thanh toán:{" "}
                      </span>
                      <span>
                        {getPaymentMethodText(selectedOrder.payment_method)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày đặt: </span>
                      <span>{formatDateTime(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
