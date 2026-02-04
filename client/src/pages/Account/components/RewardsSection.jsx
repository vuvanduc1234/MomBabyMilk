import { useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Star, History, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Mock data
const mockRewards = [
  {
    id: "1",
    name: "Voucher giảm 50.000đ",
    description: "Áp dụng cho đơn hàng từ 500.000đ",
    points_required: 100,
    stock: 50,
    image_url: "/labels/voucher-50k.png",
  },
  {
    id: "2",
    name: "Voucher giảm 100.000đ",
    description: "Áp dụng cho đơn hàng từ 1.000.000đ",
    points_required: 200,
    stock: 30,
    image_url: "/labels/voucher-100k.png",
  },
  {
    id: "3",
    name: "Bình sữa Pigeon 240ml",
    description: "Bình sữa cao cấp cho bé",
    points_required: 500,
    stock: 10,
    image_url: "/labels/bottle.png",
  },
  {
    id: "4",
    name: "Gấu bông Teddy Bear",
    description: "Gấu bông mềm mại an toàn cho bé",
    points_required: 800,
    stock: 5,
    image_url: "/labels/teddy.png",
  },
];

const mockRedemptions = [
  {
    id: "1",
    reward: {
      name: "Voucher giảm 50.000đ",
      image_url: "/labels/voucher-50k.png",
    },
    created_at: "2026-01-15T10:30:00",
    status: "completed",
    points_spent: 100,
  },
  {
    id: "2",
    reward: {
      name: "Bình sữa Pigeon 240ml",
      image_url: "/labels/bottle.png",
    },
    created_at: "2026-01-20T14:15:00",
    status: "pending",
    points_spent: 500,
  },
];

const mockTransactions = [
  {
    id: "1",
    type: "earn",
    description: "Mua hàng đơn #12345",
    points: 50,
    created_at: "2026-01-25T16:20:00",
  },
  {
    id: "2",
    type: "redeem",
    description: "Đổi Voucher giảm 50.000đ",
    points: -100,
    created_at: "2026-01-15T10:30:00",
  },
  {
    id: "3",
    type: "earn",
    description: "Mua hàng đơn #12340",
    points: 120,
    created_at: "2026-01-10T09:15:00",
  },
  {
    id: "4",
    type: "bonus",
    description: "Thưởng khách hàng thân thiết",
    points: 200,
    created_at: "2026-01-01T00:00:00",
  },
];

export default function RewardsSection() {
  const [redeemingId, setRedeemingId] = useState(null);
  const [userPoints] = useState(350);

  const rewards = mockRewards;
  const redemptions = mockRedemptions;
  const transactions = mockTransactions;
  const rewardsLoading = false;

  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    if (userPoints < pointsRequired) {
      alert("Bạn không đủ điểm để đổi quà này");
      return;
    }

    setRedeemingId(rewardId);

    // Simulate API call
    setTimeout(() => {
      alert(`Đã đổi thành công: ${rewardName}`);
      setRedeemingId(null);
    }, 1000);
  };

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
                <span className="text-4xl font-bold text-primary">2350</span>
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
      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Quà tặng
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
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
                  <Card key={reward.id} className="overflow-hidden py-0 gap-0 ring-[#f1d4e0]">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {reward.image_url ? (
                        <img
                          src={reward.image_url}
                          alt={reward.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">
                        {reward.name}
                      </h3>
                      {reward.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {reward.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={canRedeem ? "default" : "secondary"}>
                          <Star className="h-3 w-3 mr-1" />
                          {reward.points_required} điểm
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Còn {reward.stock}
                        </span>
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
                        className="w-full mt-3"
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
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Redemptions */}
          <Card className="ring-[#f1d4e0]">
            <CardHeader>
              <CardTitle>Quà đã đổi</CardTitle>
            </CardHeader>
            <CardContent>
              {redemptions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Bạn chưa đổi quà nào
                </p>
              ) : (
                <div className="space-y-4">
                  {redemptions?.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {redemption.reward?.image_url ? (
                          <img
                            src={redemption.reward.image_url}
                            alt={redemption.reward?.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Gift className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {redemption.reward?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(redemption.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            redemption.status === "completed"
                              ? "default"
                              : redemption.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {redemption.status === "pending"
                            ? "Đang xử lý"
                            : redemption.status === "completed"
                              ? "Hoàn thành"
                              : redemption.status === "approved"
                                ? "Đã duyệt"
                                : "Từ chối"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          -{redemption.points_spent} điểm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Point Transactions */}
          {/* <Card className="ring-[#f1d4e0]">
            <CardHeader>
              <CardTitle>Lịch sử điểm</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có giao dịch điểm nào
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {transaction.type === "earn"
                            ? "Tích điểm"
                            : transaction.type === "redeem"
                              ? "Đổi quà"
                              : transaction.type === "bonus"
                                ? "Thưởng"
                                : "Hết hạn"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description ||
                            formatDateTime(transaction.created_at)}
                        </p>
                      </div>
                      <span
                        className={`font-semibold ${transaction.points > 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
