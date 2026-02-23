import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyPointBalance } from "@/services/pointService";
import {
  AlertCircle,
  Award,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PointsCard() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyPointBalance();
      setBalance(response.data);
    } catch (err) {
      console.error("Error fetching point balance:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin điểm");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Điểm Tích Lũy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Điểm Tích Lũy</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-pink-500" />
          Điểm Tích Lũy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Balance Display */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">Điểm Khả Dụng</p>
            <p className="mt-2 text-4xl font-bold">
              {balance?.balance?.toLocaleString() || 0}
            </p>
            <p className="mt-1 text-xs opacity-75">điểm</p>
          </div>
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10" />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Pending Points */}
          <div className="rounded-lg border bg-amber-50 p-3 text-center">
            <Clock className="mx-auto h-5 w-5 text-amber-600" />
            <p className="mt-2 text-lg font-semibold text-amber-900">
              {balance?.pendingPoints?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-amber-700">Đang chờ</p>
          </div>

          {/* Total Earned */}
          <div className="rounded-lg border bg-green-50 p-3 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-green-600" />
            <p className="mt-2 text-lg font-semibold text-green-900">
              {balance?.totalEarned?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-green-700">Đã tích lũy</p>
          </div>

          {/* Total Spent */}
          <div className="rounded-lg border bg-red-50 p-3 text-center">
            <TrendingDown className="mx-auto h-5 w-5 text-red-600" />
            <p className="mt-2 text-lg font-semibold text-red-900">
              {balance?.totalSpent?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-red-700">Đã dùng</p>
          </div>
        </div>

        {/* Info Banner */}
        <Alert className="border-pink-200 bg-pink-50">
          <AlertCircle className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-xs text-pink-800">
            Tích 1 điểm cho mỗi 100 VND. Điểm chờ sẽ được xác nhận khi đơn hàng
            giao thành công. Dùng điểm để đổi voucher giảm giá!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
