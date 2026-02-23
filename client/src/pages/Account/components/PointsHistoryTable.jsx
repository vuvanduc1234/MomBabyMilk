import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyPointHistory } from "@/services/pointService";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TYPE_CONFIG = {
  earn: {
    label: "Tích điểm",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: TrendingUp,
  },
  redeem: {
    label: "Đổi voucher",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TrendingDown,
  },
  refund: {
    label: "Hoàn điểm",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: TrendingUp,
  },
};

const STATUS_CONFIG = {
  pending: {
    label: "Đang chờ",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function PointsHistoryTable() {
  const [histories, setHistories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyPointHistory(pagination.limit, page);
      setHistories(response.data || []);
      setPagination(
        response.pagination || { page, limit: 10, total: 0, totalPages: 0 },
      );
    } catch (err) {
      console.error("Error fetching point history:", err);
      setError(
        err.response?.data?.message || "Không thể tải lịch sử giao dịch",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPoints = (amount) => {
    const absAmount = Math.abs(amount);
    const prefix = amount >= 0 ? "+" : "-";
    return `${prefix}${absAmount.toLocaleString()}`;
  };

  if (loading && histories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Giao Dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && histories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Giao Dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch Sử Giao Dịch</CardTitle>
      </CardHeader>
      <CardContent>
        {histories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">Chưa có giao dịch nào</p>
            <p className="text-xs text-gray-400">
              Giao dịch của bạn sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead className="text-right">Điểm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Số dư sau</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histories.map((history) => {
                    const typeConfig =
                      TYPE_CONFIG[history.type] || TYPE_CONFIG.earn;
                    const statusConfig =
                      STATUS_CONFIG[history.status] || STATUS_CONFIG.pending;
                    const Icon = typeConfig.icon;

                    return (
                      <TableRow key={history._id}>
                        <TableCell className="text-xs text-gray-600">
                          {formatDate(history.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeConfig.color}>
                            <Icon className="mr-1 h-3 w-3" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div>
                            <p className="text-sm font-medium">
                              {history.reason}
                            </p>
                            {history.relatedOrder && (
                              <p className="text-xs text-gray-500">
                                Đơn hàng:{" "}
                                {history.relatedOrder._id?.slice(-8) || "N/A"}
                              </p>
                            )}
                            {history.relatedReward && (
                              <p className="text-xs text-gray-500">
                                Phần thưởng:{" "}
                                {history.relatedReward.name || "N/A"}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              history.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPoints(history.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig.color}
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {history.balanceAfter?.toLocaleString() || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages} (Tổng{" "}
                  {pagination.total} giao dịch)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
