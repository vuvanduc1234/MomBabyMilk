import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Package,
  UserCheck,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";

// Mock data - thay thế bằng API thực
const mockDashboardData = {
  stats: {
    totalUsers: 1245,
    activeUsers: 856,
    totalRevenue: 45678900000,
    monthlyRevenue: 12345000000,
    totalOrders: 3456,
    pendingOrders: 23,
  },
  revenueChange: 12.5,
  ordersChange: 8.3,
  usersChange: 5.7,
  recentActivities: [
    {
      id: 1,
      type: "user_registered",
      message: "Nguyễn Thị Lan đã đăng ký tài khoản mới",
      time: "5 phút trước",
    },
    {
      id: 2,
      type: "order_placed",
      message: "Đơn hàng ORD-2026-156 được tạo (2,450,000₫)",
      time: "15 phút trước",
    },
    {
      id: 3,
      type: "role_updated",
      message: "Quyền 'Staff Manager' đã được cập nhật",
      time: "1 giờ trước",
    },
    {
      id: 4,
      type: "revenue_milestone",
      message: "Doanh thu tháng này đạt 12 tỷ đồng",
      time: "2 giờ trước",
    },
  ],
  topProducts: [
    { name: "Similac Gain Plus 900g", sales: 234, revenue: 146250000 },
    { name: "Enfamil A+ 400g", sales: 189, revenue: 85050000 },
    { name: "Abbott Grow Gold 1.7kg", sales: 156, revenue: 132600000 },
    { name: "Meiji Infant Formula 800g", sales: 145, revenue: 94250000 },
    { name: "Aptamil Essensis 800g", sales: 123, revenue: 57810000 },
  ],
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatCompactPrice = (price) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B₫`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M₫`;
  }
  return formatPrice(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";

  const date = new Date(dateString);

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", dateString);
    return "Ngày không hợp lệ";
  }

  const now = new Date();
  const diffTime = now - date; // Changed to show "ago" format
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 1 ? "Vừa xong" : `${diffMinutes} phút trước`;
    }
    return `${diffHours} giờ trước`;
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
};

const formatExpiryDate = (dateString) => {
  if (!dateString) return "Không xác định";

  const date = new Date(dateString);

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }

  const now = new Date();
  const diffTime = date - now; // Future date
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Đã hết hạn";
  } else if (diffDays === 0) {
    return "Hôm nay";
  } else if (diffDays === 1) {
    return "Ngày mai";
  } else if (diffDays < 7) {
    return `${diffDays} ngày nữa`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần nữa`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng nữa`;
  } else {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
};

export default function AdminDashboard() {
  const [data, setData] = useState(mockDashboardData);
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [vouchersError, setVouchersError] = useState(null);

  // Fetch real stats: users + orders
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.allSettled([
          axiosInstance.get("/api/users"),
          axiosInstance.get("/api/orders"),
        ]);

        setData((prev) => {
          const updated = { ...prev, stats: { ...prev.stats } };

          if (usersRes.status === "fulfilled") {
            const users =
              usersRes.value.data?.data || usersRes.value.data || [];
            const userList = Array.isArray(users) ? users : [];
            updated.stats.totalUsers = userList.length;
            updated.stats.activeUsers = userList.filter(
              (u) => u.status === "active" || u.isActive === true,
            ).length;
          }

          if (ordersRes.status === "fulfilled") {
            const orders =
              ordersRes.value.data?.data || ordersRes.value.data || [];
            const orderList = Array.isArray(orders) ? orders : [];
            updated.stats.totalOrders = orderList.length;
            updated.stats.pendingOrders = orderList.filter(
              (o) =>
                o.status === "pending" ||
                o.status === "Pending" ||
                o.orderStatus === "pending",
            ).length;
          }

          return updated;
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch vouchers from API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setVouchersLoading(true);
        setVouchersError(null);

        const result = await axiosInstance.get("/api/voucher");
        const voucherData =
          result.data?.data || result.data?.vouchers || result.data || [];

        const allActiveVouchers = (
          Array.isArray(voucherData) ? voucherData : []
        )
          .filter((v) => v.isActive === true)
          .sort((a, b) => {
            if (a.expiryDate && b.expiryDate) {
              return new Date(a.expiryDate) - new Date(b.expiryDate);
            }
            if (a.expiryDate) return -1;
            if (b.expiryDate) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

        setVouchers(allActiveVouchers.slice(0, 5));
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setVouchersError(error.response?.data?.message || error.message);
      } finally {
        setVouchersLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend, linkTo }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={trend === "up" ? "text-green-600" : "text-red-600"}
            >
              {change}%
            </span>
            <span className="ml-1">so với tháng trước</span>
          </div>
        )}
        {linkTo && (
          <Button variant="link" size="sm" asChild className="px-0 mt-2">
            <Link to={linkTo}>Xem chi tiết →</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const VoucherCard = ({ voucher }) => {
    const expiryDate = voucher.expiryDate || voucher.expiry_date;
    const daysUntilExpiry = expiryDate
      ? Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    const isExpiringSoon =
      daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-sm text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
              {voucher.code}
            </span>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
              -{voucher.discountPercentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {voucher.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span>Đã dùng: {voucher.usageCount || 0}</span>
            {expiryDate && (
              <span
                className={isExpiringSoon ? "text-orange-600 font-medium" : ""}
              >
                HSD: {formatExpiryDate(expiryDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan hệ thống và hoạt động quản trị
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={data.stats.totalUsers.toLocaleString()}
          change={data.usersChange}
          trend="up"
          icon={Users}
          linkTo="/admin/accounts"
        />
        <StatCard
          title="Người dùng hoạt động"
          value={data.stats.activeUsers.toLocaleString()}
          icon={UserCheck}
          linkTo="/admin/accounts"
        />
        <StatCard
          title="Doanh thu tháng này"
          value={formatCompactPrice(data.stats.monthlyRevenue)}
          change={data.revenueChange}
          trend="up"
          icon={DollarSign}
          linkTo="/admin/revenue"
        />
        <StatCard
          title="Đơn hàng chờ xử lý"
          value={data.stats.pendingOrders.toLocaleString()}
          icon={ShoppingCart}
          linkTo="/staff/orders"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/admin/reports">Xem tất cả hoạt động</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sản phẩm bán chạy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} đã bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-pink-600">
                      {formatCompactPrice(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/staff/products">Quản lý sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Vouchers Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Voucher đang hoạt động
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/vouchers">Xem tất cả</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vouchersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
                <p className="text-sm text-muted-foreground">
                  Đang tải voucher...
                </p>
              </div>
            </div>
          ) : vouchersError ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-red-600">
                  Không thể tải voucher
                </p>
                <p className="text-xs text-muted-foreground">{vouchersError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Không có voucher đang hoạt động
                </p>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link to="/admin/vouchers">Tạo voucher mới</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id || voucher._id || voucher.code}
                  voucher={voucher}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/accounts" className="block p-6">
            <Users className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-semibold mb-1">Quản lý tài khoản</h3>
            <p className="text-sm text-muted-foreground">
              Thêm, sửa, xóa người dùng
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/roles" className="block p-6">
            <ShieldCheck className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-semibold mb-1">Phân quyền</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý vai trò và quyền hạn
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/revenue" className="block p-6">
            <TrendingUp className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-semibold mb-1">Thống kê doanh thu</h3>
            <p className="text-sm text-muted-foreground">
              Xem báo cáo tài chính
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/reports" className="block p-6">
            <Activity className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-semibold mb-1">Báo cáo hệ thống</h3>
            <p className="text-sm text-muted-foreground">
              Logs và audit trails
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/vouchers" className="block p-6">
            <Tag className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-semibold mb-1">Voucher</h3>
            <p className="text-sm text-muted-foreground">
              Tạo và quản lý mã giảm giá
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
}
