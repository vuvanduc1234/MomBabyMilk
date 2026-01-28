import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock revenue data
const mockRevenueData = {
  current: {
    total: 45678900000,
    orders: 1245,
    avgOrderValue: 36680000,
    growth: 12.5,
  },
  previous: {
    total: 40603000000,
    orders: 1089,
    avgOrderValue: 37290000,
  },
  monthly: [
    { month: "Jan", revenue: 3200000000, orders: 95, year: 2026 },
    { month: "Feb", revenue: 3500000000, orders: 102, year: 2026 },
    { month: "Mar", revenue: 3800000000, orders: 115, year: 2026 },
    { month: "Apr", revenue: 4100000000, orders: 128, year: 2026 },
    { month: "May", revenue: 3900000000, orders: 119, year: 2026 },
    { month: "Jun", revenue: 4200000000, orders: 134, year: 2026 },
    { month: "Jul", revenue: 4500000000, orders: 142, year: 2026 },
    { month: "Aug", revenue: 4300000000, orders: 138, year: 2026 },
    { month: "Sep", revenue: 3700000000, orders: 109, year: 2026 },
    { month: "Oct", revenue: 4000000000, orders: 121, year: 2026 },
    { month: "Nov", revenue: 4200000000, orders: 126, year: 2026 },
    { month: "Dec", revenue: 2278900000, orders: 116, year: 2026 },
  ],
  topProducts: [
    {
      name: "Similac Gain Plus 900g",
      revenue: 5678000000,
      orders: 4521,
      growth: 15.3,
    },
    {
      name: "Enfamil A+ 400g",
      revenue: 4234000000,
      orders: 3892,
      growth: 12.1,
    },
    {
      name: "Abbott Grow Gold 1.7kg",
      revenue: 3890000000,
      orders: 2456,
      growth: 8.7,
    },
    {
      name: "Meiji Infant Formula 800g",
      revenue: 3456000000,
      orders: 2890,
      growth: -2.4,
    },
    {
      name: "Aptamil Essensis 800g",
      revenue: 2987000000,
      orders: 2234,
      growth: 5.8,
    },
  ],
  categories: [
    { name: "Sữa công thức", revenue: 28000000000, percentage: 61.3 },
    { name: "Sữa bà bầu", revenue: 12000000000, percentage: 26.3 },
    { name: "Phụ kiện", revenue: 5678900000, percentage: 12.4 },
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

export default function RevenueStatistics() {
  const [timeRange, setTimeRange] = useState("year");
  const [data] = useState(mockRevenueData);

  const handleExport = () => {
    console.log("Exporting revenue report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Thống kê doanh thu và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Main Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Tổng doanh thu
              <DollarSign className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompactPrice(data.current.total)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">{data.current.growth}%</span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Đơn hàng
              <ShoppingCart className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.current.orders.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">
                {(
                  ((data.current.orders - data.previous.orders) /
                    data.previous.orders) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Giá trị TB/đơn
              <TrendingUp className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompactPrice(data.current.avgOrderValue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600">
                {(
                  ((data.current.avgOrderValue - data.previous.avgOrderValue) /
                    data.previous.avgOrderValue) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Tỷ lệ tăng trưởng
              <TrendingUp className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.current.growth}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Tăng trưởng doanh thu
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart & Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Revenue Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-end justify-between gap-2">
              {data.monthly.map((month, index) => {
                const maxRevenue = Math.max(
                  ...data.monthly.map((m) => m.revenue),
                );
                const height = (month.revenue / maxRevenue) * 100;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full bg-gray-100 rounded hover:bg-gray-200 transition-colors relative group cursor-pointer">
                      <div
                        className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded transition-all duration-300"
                        style={{ height: `${height * 3.5}px` }}
                      />
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="font-semibold">
                          {formatCompactPrice(month.revenue)}
                        </div>
                        <div className="text-gray-300">{month.orders} đơn</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {month.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCompactPrice(category.revenue)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tổng doanh thu</span>
                <span className="text-lg font-bold text-pink-600">
                  {formatCompactPrice(data.current.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sản phẩm doanh thu cao nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-pink-100 text-pink-600 font-bold rounded-full">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.orders.toLocaleString()} đơn hàng
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-pink-600">
                    {formatCompactPrice(product.revenue)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-sm">
                    {product.growth > 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">
                          {product.growth}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">
                          {Math.abs(product.growth)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
