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

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatCompactPrice = (price) => {
  if (!price) return "0₫";
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B₫`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M₫`;
  }
  return formatPrice(price);
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
    },
    revenueChange: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [vouchersError, setVouchersError] = useState(null);

  // Fetch all dashboard data from Analytics API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [usersRes, revenueSummaryRes, ordersStatsRes, topProductsRes] =
          await Promise.allSettled([
            axiosInstance.get("/api/users"),
            axiosInstance.get("/api/analytics/revenue-summary"),
            axiosInstance.get("/api/analytics/orders-stats"),
            axiosInstance.get("/api/analytics/top-products?limit=5"),
          ]);

        const updated = {
          stats: {
            totalUsers: 0,
            activeUsers: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
          },
          revenueChange: 0,
        };

        // Users stats
        if (usersRes.status === "fulfilled") {
          const users = usersRes.value.data?.data || usersRes.value.data || [];
          const userList = Array.isArray(users) ? users : [];
          updated.stats.totalUsers = userList.length;
          updated.stats.activeUsers = userList.filter(
            (u) => u.isVerified === true,
          ).length;
        }

        // Revenue stats
        if (revenueSummaryRes.status === "fulfilled") {
          const summaryData = revenueSummaryRes.value.data?.data;
          if (summaryData) {
            updated.stats.monthlyRevenue = summaryData.thisMonth?.revenue || 0;
            updated.stats.totalRevenue = summaryData.thisYear?.revenue || 0;
          }
        }

        // Orders stats
        if (ordersStatsRes.status === "fulfilled") {
          const ordersData = ordersStatsRes.value.data?.data;
          if (ordersData) {
            updated.stats.totalOrders = ordersData.total || 0;
            updated.stats.pendingOrders = ordersData.byStatus?.processing || 0;
          }
        }

        // Top products
        if (topProductsRes.status === "fulfilled") {
          const productsData = topProductsRes.value.data?.data || [];
          setTopProducts(
            productsData.map((p) => ({
              name: p.productName || p.name,
              sales: p.quantitySold || p.totalQuantity || 0,
              revenue: p.totalRevenue || 0,
            })),
          );
        }

        setData(updated);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
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

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm bán chạy nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu sản phẩm
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between pb-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-pink-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.sales} đã bán
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-sm font-semibold text-pink-600">
                            {formatCompactPrice(product.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="/staff/products">Xem tất cả sản phẩm</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Vouchers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Voucher đang hoạt động
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/staff/vouchers">Xem tất cả</Link>
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
                    <p className="text-xs text-muted-foreground">
                      {vouchersError}
                    </p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-2"
                    >
                      <Link to="/staff/vouchers">Tạo voucher mới</Link>
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
              <Link to="/staff/vouchers" className="block p-6">
                <Tag className="h-8 w-8 text-pink-600 mb-3" />
                <h3 className="font-semibold mb-1">Voucher</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý mã giảm giá
                </p>
              </Link>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
