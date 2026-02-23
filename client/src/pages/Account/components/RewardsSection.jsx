import { useState, useEffect } from "react";
import { Gift, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAvailableRewards,
  redeemReward,
  getMyPointBalance,
} from "@/services/pointService";
import { toast } from "sonner";

export default function RewardsSection() {
  const [redeemingId, setRedeemingId] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRewardsLoading(true);
      setError(null);

      // Fetch both rewards and points balance
      const [rewardsResponse, balanceResponse] = await Promise.all([
        getAvailableRewards(),
        getMyPointBalance(),
      ]);

      // Transform rewards data to match component structure
      const transformedRewards = (rewardsResponse.data || []).map((reward) => ({
        id: reward._id,
        name: reward.name,
        description: reward.description,
        points_required: reward.pointsCost,
        stock: reward.quantity,
        image_url: reward.imageUrl || "/labels/voucher-default.png",
      }));

      setRewards(transformedRewards);
      setUserPoints(balanceResponse.data?.balance || 0);
    } catch (err) {
      console.error("Error fetching rewards data:", err);
      setError(
        err.response?.data?.message || "Không thể tải dữ liệu phần thưởng",
      );
    } finally {
      setRewardsLoading(false);
    }
  };

  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    if (userPoints < pointsRequired) {
      toast.error("Bạn không đủ điểm để đổi quà này");
      return;
    }

    setRedeemingId(rewardId);

    try {
      await redeemReward(rewardId);
      toast.success(`Đã đổi thành công: ${rewardName}`);
      // Refresh data after successful redemption
      await fetchData();
    } catch (err) {
      console.error("Error redeeming reward:", err);
      toast.error(
        err.response?.data?.message || "Không thể đổi quà. Vui lòng thử lại.",
      );
    } finally {
      setRedeemingId(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {/* Points Summary */}
      <Card className="mb-8 bg-linear-to-r from-primary/10 to-accent/10 ring-[#f1d4e0]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-muted-foreground mb-1">
                Điểm tích lũy của bạn
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {userPoints?.toLocaleString() || 0}
                </span>
                <span className="text-muted-foreground">điểm</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Mỗi 10.000đ = 1 điểm</p>
              <p>Điểm có hiệu lực trong 12 tháng</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards List */}
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewardsLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
          ) : rewards?.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Chưa có quà tặng nào.</p>
            </div>
          ) : (
            rewards?.map((reward) => {
              const canRedeem = userPoints >= reward.points_required;
              const isRedeeming = redeemingId === reward.id;

              return (
                <Card
                  key={reward.id}
                  // Thêm 'h-full' và 'flex flex-col' để card luôn chiếm hết chiều cao hàng
                  className="h-full flex flex-col overflow-hidden py-0 gap-0 ring-[#f1d4e0] hover:shadow-md transition-shadow"
                >
                  {/* Voucher Display - Giữ cố định tỉ lệ 1:1 */}
                  <div className="aspect-square shrink-0 overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 flex flex-col items-center justify-center text-white relative">
                    <div className="absolute top-3 right-3">
                      <Gift className="h-6 w-6 opacity-20" />
                    </div>
                    <div className="text-center z-10 w-full">
                      <div className="mb-3">
                        <Gift className="h-12 w-12 mx-auto opacity-90" />
                      </div>
                      <div className="text-[10px] font-medium opacity-90 mb-1 uppercase tracking-wider">
                        PHIẾU QUÀ TẶNG
                      </div>
                      {/* Sử dụng text size nhỏ hơn hoặc linh hoạt để không bị vỡ khung với số lớn */}
                      <div className="text-xl md:text-2xl font-bold break-words px-2 leading-tight">
                        {reward.points_required} ĐIỂM
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                  </div>

                  {/* CardContent - Thêm flex-1 để chiếm toàn bộ không gian còn lại */}
                  <CardContent className="p-4 flex flex-col flex-1">
                    {/* Tiêu đề: Khống chế cố định 1 hoặc 2 dòng */}
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {reward.name}
                    </h3>

                    {/* Mô tả: Khống chế cố định 2 dòng */}
                    {reward.description ? (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[40px]">
                        {reward.description}
                      </p>
                    ) : (
                      <div className="mb-3 min-h-[40px]"></div> // Giữ khoảng trống nếu không có mô tả
                    )}

                    {/* Phần cuối Card: Dùng mt-auto để đẩy sát xuống đáy */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant={canRedeem ? "default" : "secondary"}
                          className="gap-1"
                        >
                          <Gift className="h-3 w-3" />
                          {reward.points_required} điểm
                        </Badge>
                        {reward.stock !== null && (
                          <span className="text-xs text-muted-foreground">
                            Còn {reward.stock}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() =>
                          handleRedeem(
                            reward.id,
                            reward.points_required,
                            reward.name,
                          )
                        }
                        disabled={!canRedeem || isRedeeming}
                        className="w-full"
                        size="sm"
                      >
                        {isRedeeming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : canRedeem ? (
                          "Đổi ngay"
                        ) : (
                          "Chưa đủ điểm"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
