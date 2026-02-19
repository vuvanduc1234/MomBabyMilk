import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  TrendingUp,
  DollarSign,
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

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatCompactPrice = (price) => {
  if (!price) return "0₫";
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B₫`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M₫`;
  return formatPrice(price);
};

const periodMap = {
  week: "week",
  month: "month",
  quarter: "month",
  year: "year",
};

const groupByMap = {
  week: "day",
  month: "day",
  quarter: "month",
  year: "month",
};

export default function RevenueStatistics() {
  const [timeRange, setTimeRange] = useState("year");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ordersStats, setOrdersStats] = useState(null);
  const [customersStats, setCustomersStats] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const getDateRange = (range) => {
        const end = new Date();
        const start = new Date();
        if (range === "week") start.setDate(end.getDate() - 7);
        else if (range === "month") start.setDate(end.getDate() - 30);
        else if (range === "quarter") start.setMonth(end.getMonth() - 3);
        else start.setFullYear(end.getFullYear() - 1);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
      };

      const { startDate, endDate } = getDateRange(timeRange);
      const period = periodMap[timeRange] || "year";
      const groupBy = groupByMap[timeRange] || "month";

      const [
        summaryRes,
        overviewRes,
        chartRes,
        topProductsRes,
        categoriesRes,
        ordersRes,
        customersRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/api/analytics/revenue-summary"),
        axiosInstance.get("/api/analytics/revenue", {
          params: { startDate, endDate, period },
        }),
        axiosInstance.get("/api/analytics/revenue/chart", {
          params: { startDate, endDate, groupBy },
        }),
        axiosInstance.get("/api/analytics/top-products", {
          params: { startDate, endDate, limit: 5 },
        }),
        axiosInstance.get("/api/analytics/revenue-by-category", {
          params: { startDate, endDate },
        }),
        axiosInstance.get("/api/analytics/orders-stats", {
          params: { startDate, endDate },
        }),
        axiosInstance.get("/api/analytics/customers-stats", {
          params: { startDate, endDate },
        }),
      ]);

      if (summaryRes.status === "fulfilled")
        setSummary(summaryRes.value.data?.data || summaryRes.value.data);
      if (overviewRes.status === "fulfilled") {
        const data = overviewRes.value.data?.data || overviewRes.value.data;
        setOverview(data?.overview || data);
      }
      if (chartRes.status === "fulfilled") {
        const raw = chartRes.value.data?.data || chartRes.value.data || [];
        setChartData(Array.isArray(raw) ? raw : []);
      }
      if (topProductsRes.status === "fulfilled") {
        const raw =
          topProductsRes.value.data?.data || topProductsRes.value.data || [];
        setTopProducts(Array.isArray(raw) ? raw : []);
      }
      if (categoriesRes.status === "fulfilled") {
        const raw =
          categoriesRes.value.data?.data || categoriesRes.value.data || [];
        setCategories(Array.isArray(raw) ? raw : []);
      }
      if (ordersRes.status === "fulfilled")
        setOrdersStats(ordersRes.value.data?.data || ordersRes.value.data);
      if (customersRes.status === "fulfilled")
        setCustomersStats(
          customersRes.value.data?.data || customersRes.value.data,
        );

      setLoading(false);
    };

    fetchAll();
  }, [timeRange]);

  // Calculate totals based on selected time range
  const totalRevenue = overview?.totalRevenue ?? overview?.total ?? 0;
  const growthRate =
    overview?.growthRate ?? overview?.growth ?? overview?.revenueGrowth ?? null;
  const totalOrders =
    ordersStats?.totalOrders ??
    ordersStats?.total ??
    overview?.totalOrders ??
    0;
  const avgOrderValue =
    ordersStats?.avgOrderValue ??
    overview?.avgOrderValue ??
    (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0);
  const totalCustomers =
    customersStats?.totalCustomers ?? customersStats?.total ?? 0;

  const maxChartRevenue =
    chartData.length > 0
      ? Math.max(...chartData.map((d) => d.revenue ?? d.total ?? 0))
      : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Thống kê doanh thu và hiệu suất kinh doanh
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">7 ngày qua</SelectItem>
            <SelectItem value="month">30 ngày qua</SelectItem>
            <SelectItem value="quarter">Quý này</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
        </div>
      ) : (
        <>
          {/* Revenue Summary (today/week/month/year) */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Hôm nay", value: summary.today?.revenue },
                { label: "Tuần này", value: summary.thisWeek?.revenue },
                { label: "Tháng này", value: summary.thisMonth?.revenue },
                { label: "Năm nay", value: summary.thisYear?.revenue },
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-pink-600">
                      {formatCompactPrice(item.value ?? 0)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Main KPI Cards */}
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
                  {formatCompactPrice(totalRevenue)}
                </div>
                {growthRate !== null && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {growthRate >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={
                        growthRate >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {Math.abs(growthRate).toFixed(1)}%
                    </span>
                    <span className="ml-1">so với kỳ trước</span>
                  </div>
                )}
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
                  {Number(totalOrders).toLocaleString()}
                </div>
                {ordersStats?.pendingOrders != null && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {ordersStats.pendingOrders} đơn chờ xử lý
                  </div>
                )}
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
                  {formatCompactPrice(avgOrderValue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Khách hàng
                  <Users className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number(totalCustomers).toLocaleString()}
                </div>
                {customersStats?.newCustomers != null && (
                  <div className="text-xs text-muted-foreground mt-1">
                    +{customersStats.newCustomers} khách mới
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart & Categories */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Doanh thu theo thời gian</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Không có dữ liệu
                  </div>
                ) : (
                  <div className="h-[300px] flex items-end justify-between gap-1">
                    {chartData.map((item, index) => {
                      const rev = item.revenue ?? item.total ?? 0;
                      const height =
                        maxChartRevenue > 0 ? (rev / maxChartRevenue) * 100 : 0;
                      const label =
                        item.label ??
                        item.month ??
                        item.date ??
                        item.day ??
                        String(index + 1);
                      const orders = item.orders ?? item.orderCount ?? null;

                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div className="w-full relative group cursor-pointer">
                            <div
                              className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded transition-all duration-300"
                              style={{ height: `${height * 2.8}px` }}
                            />
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              <div className="font-semibold">
                                {formatCompactPrice(rev)}
                              </div>
                              {orders !== null && (
                                <div className="text-gray-300">
                                  {orders} đơn
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((cat, index) => {
                      const catRevenue = cat.revenue ?? cat.totalRevenue ?? 0;
                      const totalCatRevenue = categories.reduce(
                        (s, c) => s + (c.revenue ?? c.totalRevenue ?? 0),
                        0,
                      );
                      const percentage =
                        cat.percentage ??
                        (totalCatRevenue > 0
                          ? ((catRevenue / totalCatRevenue) * 100).toFixed(1)
                          : 0);
                      const catName =
                        cat.name ?? cat.categoryName ?? cat.category ?? "—";

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{catName}</span>
                            <span className="text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCompactPrice(catRevenue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng</span>
                  <span className="text-lg font-bold text-pink-600">
                    {formatCompactPrice(totalRevenue)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Status Breakdown */}
          {ordersStats && (
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Đã hoàn thành",
                  value:
                    ordersStats.completedOrders ??
                    ordersStats.delivered ??
                    null,
                  color: "text-green-600",
                },
                {
                  label: "Đang xử lý",
                  value:
                    ordersStats.processingOrders ??
                    ordersStats.processing ??
                    null,
                  color: "text-blue-600",
                },
                {
                  label: "Chờ xác nhận",
                  value:
                    ordersStats.pendingOrders ?? ordersStats.pending ?? null,
                  color: "text-amber-600",
                },
                {
                  label: "Đã hủy",
                  value:
                    ordersStats.cancelledOrders ??
                    ordersStats.cancelled ??
                    null,
                  color: "text-red-600",
                },
              ]
                .filter((item) => item.value !== null)
                .map((item, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${item.color}`}>
                        {Number(item.value).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Top Products */}
          {topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sản phẩm doanh thu cao nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => {
                    const name =
                      product.name ??
                      product.productName ??
                      product.title ??
                      "—";
                    const revenue =
                      product.revenue ?? product.totalRevenue ?? 0;
                    const orders =
                      product.orders ??
                      product.totalOrders ??
                      product.sold ??
                      null;
                    const growth = product.growth ?? product.growthRate ?? null;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-pink-100 text-pink-600 font-bold rounded-full shrink-0">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{name}</div>
                            {orders !== null && (
                              <div className="text-sm text-muted-foreground">
                                {Number(orders).toLocaleString()} đơn hàng
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-pink-600">
                            {formatCompactPrice(revenue)}
                          </div>
                          {growth !== null && (
                            <div className="flex items-center justify-end gap-1 text-sm">
                              {growth >= 0 ? (
                                <>
                                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">
                                    {growth}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                                  <span className="text-red-600">
                                    {Math.abs(growth)}%
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Customers */}
          {customersStats?.topCustomers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Khách hàng mua nhiều nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customersStats.topCustomers.map((customer, index) => {
                    const name =
                      customer.name ??
                      customer.fullname ??
                      customer.fullName ??
                      "—";
                    const spent =
                      customer.totalSpent ??
                      customer.revenue ??
                      customer.spent ??
                      0;
                    const orders =
                      customer.totalOrders ?? customer.orders ?? null;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-pink-100 text-pink-600 font-bold rounded-full text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{name}</div>
                            {orders !== null && (
                              <div className="text-xs text-muted-foreground">
                                {orders} đơn hàng
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-pink-600">
                          {formatCompactPrice(spent)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
