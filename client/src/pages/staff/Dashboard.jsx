import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  MessageSquare,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const mockStats = {
  totalPendingOrders: 8,
  totalConfirmedOrders: 15,
  totalShippingOrders: 12,
  lowStockProducts: [
    {
      id: 1,
      name: "Similac Gain Plus 900g",
      stock: 3,
      image_url: "/placeholder.jpg",
      slug: "similac-gain-plus-900g",
    },
    {
      id: 2,
      name: "Enfamil A+ 400g",
      stock: 5,
      image_url: "/placeholder.jpg",
      slug: "enfamil-a-plus-400g",
    },
    {
      id: 3,
      name: "Abbott Grow Gold 1.7kg",
      stock: 7,
      image_url: "/placeholder.jpg",
      slug: "abbott-grow-gold-1700g",
    },
    {
      id: 4,
      name: "Aptamil Essensis 800g",
      stock: 4,
      image_url: "/placeholder.jpg",
      slug: "aptamil-essensis-800g",
    },
    {
      id: 5,
      name: "Meiji Infant Formula 800g",
      stock: 6,
      image_url: "/placeholder.jpg",
      slug: "meiji-infant-formula-800g",
    },
  ],
  pendingOrders: [
    {
      id: 1,
      order_number: "ORD-2026-001",
      customer_name: "Nguyễn Thị Lan",
      total: 1250000,
      created_at: "2026-01-28T08:30:00Z",
      status: "pending",
    },
    {
      id: 2,
      order_number: "ORD-2026-002",
      customer_name: "Trần Văn Minh",
      total: 890000,
      created_at: "2026-01-28T09:15:00Z",
      status: "pending",
    },
    {
      id: 3,
      order_number: "ORD-2026-003",
      customer_name: "Lê Thị Hương",
      total: 2150000,
      created_at: "2026-01-28T10:00:00Z",
      status: "pending",
    },
    {
      id: 4,
      order_number: "ORD-2026-004",
      customer_name: "Phạm Quốc Anh",
      total: 650000,
      created_at: "2026-01-28T10:45:00Z",
      status: "pending",
    },
    {
      id: 5,
      order_number: "ORD-2026-005",
      customer_name: "Hoàng Thị Mai",
      total: 1780000,
      created_at: "2026-01-28T11:20:00Z",
      status: "pending",
    },
  ],
  ordersByStatus: {
    pending: 8,
    confirmed: 15,
    shipping: 12,
  },
};

// Format price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Format date time helper
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

const cardClasses = {
  card: "",
  cardHeader: "flex flex-row items-center justify-between pb-2",
  cardTitle: "font-medium text-muted-foreground tracking-tight flex items-center",
  cardContent: "text-4xl font-medium tracking-tight mb-1",
};

export default function StaffDashboard() {
  const [isLoading] = useState(false);
  const stats = mockStats;

  return (
    <div className="space-y-6">
       <div className="pt-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Staff Dashboard
        </h1>
        <p className="text-muted-foreground">Tổng quan công việc hàng ngày</p>
      </div>

      {/* Order Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClasses.card}>
          <CardHeader className={cardClasses.cardHeader}>
            <CardTitle className={cardClasses.cardTitle}>
              <Clock className="w-5 h-5 mr-2 inline-block" />
              Chờ xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cardClasses.cardContent}>
              {stats?.totalPendingOrders}
            </div>
            <p className="text-sm text-muted-foreground">đơn hàng cần xử lý</p>
          </CardContent>
        </Card>

        <Card className={cardClasses.card}>
          <CardHeader className={cardClasses.cardHeader}>
            <CardTitle className={cardClasses.cardTitle}>
              <CheckCircle className="w-5 h-5 mr-2 inline-block" />
              Đang xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cardClasses.cardContent}>
              {stats?.totalConfirmedOrders}
            </div>
            <p className="text-sm text-muted-foreground">đơn đã xác nhận</p>
          </CardContent>
        </Card>

        <Card className={cardClasses.card}>
          <CardHeader className={cardClasses.cardHeader}>
            <CardTitle className={cardClasses.cardTitle}>
              <Truck className="w-5 h-5 mr-2 inline-block" />
              Đang giao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cardClasses.cardContent}>
              {stats?.totalShippingOrders}
            </div>
            <p className="text-sm text-muted-foreground">đơn đang vận chuyển</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Pending Orders */}
        <Card className="py-4 gap-4">
          <CardHeader className="flex flex-row items-center justify-between px-4 mb-0">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Đơn hàng chờ xử lý
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/orders" className="flex items-center gap-1">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4">
            {stats?.pendingOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Không có đơn hàng chờ xử lý
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="py-4 gap-4">
          <CardHeader className="flex flex-row items-center justify-between px-5">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cảnh báo hết hàng
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/inventory" className="flex items-center gap-1">
                Xem kho <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4">
            {stats?.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Không có sản phẩm sắp hết hàng
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <p className="font-medium line-clamp-1">{product.name}</p>
                    </div>
                    <Badge
                      variant={product.stock <= 5 ? "destructive" : "secondary"}
                    >
                      Còn {product.stock}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
