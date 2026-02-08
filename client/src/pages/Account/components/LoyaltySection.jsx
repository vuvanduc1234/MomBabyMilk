import { Link } from "react-router-dom";
import {
  Crown,
  Star,
  Gift,
  TrendingUp,
  Shield,
  Truck,
  Percent,
  Award,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Mock data for loyalty tiers
const LOYALTY_TIERS = [
  {
    id: "bronze",
    name: "Đồng",
    minPoints: 0,
    maxPoints: 999,
    color: "bg-amber-600",
    textColor: "text-amber-600",
    borderColor: "border-amber-600",
    icon: Star,
    benefits: [
      { icon: Percent, text: "Giảm 2% cho mỗi đơn hàng" },
      { icon: Gift, text: "Quà sinh nhật" },
    ],
  },
  {
    id: "silver",
    name: "Bạc",
    minPoints: 1000,
    maxPoints: 4999,
    color: "bg-slate-400",
    textColor: "text-slate-500",
    borderColor: "border-slate-400",
    icon: Award,
    benefits: [
      { icon: Percent, text: "Giảm 5% cho mỗi đơn hàng" },
      { icon: Gift, text: "Quà sinh nhật đặc biệt" },
      { icon: Truck, text: "Miễn phí vận chuyển đơn từ 300K" },
    ],
  },
  {
    id: "gold",
    name: "Vàng",
    minPoints: 5000,
    maxPoints: 14999,
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    icon: Crown,
    benefits: [
      { icon: Percent, text: "Giảm 10% cho mỗi đơn hàng" },
      { icon: Gift, text: "Quà sinh nhật cao cấp" },
      { icon: Truck, text: "Miễn phí vận chuyển mọi đơn" },
      { icon: Shield, text: "Ưu tiên hỗ trợ khách hàng" },
    ],
  },
  {
    id: "platinum",
    name: "Bạch Kim",
    minPoints: 15000,
    maxPoints: Infinity,
    color: "bg-gradient-to-r from-slate-600 to-slate-400",
    textColor: "text-slate-600",
    borderColor: "border-slate-600",
    icon: Crown,
    benefits: [
      { icon: Percent, text: "Giảm 15% cho mỗi đơn hàng" },
      { icon: Gift, text: "Quà sinh nhật VIP" },
      { icon: Truck, text: "Miễn phí vận chuyển mọi đơn" },
      { icon: Shield, text: "Hotline riêng 24/7" },
      { icon: TrendingUp, text: "Điểm thưởng x2" },
    ],
  },
];

// Mock data for point transactions
const MOCK_TRANSACTIONS = [
  {
    id: "1",
    type: "earn",
    points: 150,
    description: "Tích điểm đơn hàng #DH001234",
    order_total: 1500000,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    type: "earn",
    points: 80,
    description: "Tích điểm đơn hàng #DH001235",
    order_total: 800000,
    created_at: "2024-01-10T14:20:00Z",
  },
  {
    id: "3",
    type: "redeem",
    points: -100,
    description: "Đổi quà: Bộ bình sữa Pigeon",
    created_at: "2024-01-08T09:15:00Z",
  },
  {
    id: "4",
    type: "earn",
    points: 200,
    description: "Tích điểm đơn hàng #DH001230",
    order_total: 2000000,
    created_at: "2024-01-05T16:45:00Z",
  },
  {
    id: "5",
    type: "bonus",
    points: 50,
    description: "Thưởng sinh nhật",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    type: "earn",
    points: 120,
    description: "Tích điểm đơn hàng #DH001225",
    order_total: 1200000,
    created_at: "2023-12-28T11:30:00Z",
  },
  {
    id: "7",
    type: "redeem",
    points: -200,
    description: "Đổi voucher giảm 50K",
    created_at: "2023-12-20T08:00:00Z",
  },
  {
    id: "8",
    type: "earn",
    points: 95,
    description: "Tích điểm đơn hàng #DH001220",
    order_total: 950000,
    created_at: "2023-12-15T13:20:00Z",
  },
];

// Mock user points
const MOCK_USER_POINTS = 2350;

export default function LoyaltySection() {
  // Use mock data
  const userPoints = MOCK_USER_POINTS;
  const transactions = MOCK_TRANSACTIONS;

  // Calculate current tier
  const currentTier =
    LOYALTY_TIERS.find(
      (tier) => userPoints >= tier.minPoints && userPoints <= tier.maxPoints,
    ) || LOYALTY_TIERS[0];

  const currentTierIndex = LOYALTY_TIERS.findIndex(
    (t) => t.id === currentTier.id,
  );
  const nextTier = LOYALTY_TIERS[currentTierIndex + 1];

  // Calculate progress to next tier
  const progressToNextTier = nextTier
    ? ((userPoints - currentTier.minPoints) /
        (nextTier.minPoints - currentTier.minPoints)) *
      100
    : 100;

  const pointsToNextTier = nextTier ? nextTier.minPoints - userPoints : 0;

  // Calculate total earned and spent
  const totalEarned = transactions
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + t.points, 0),
  );

  const TierIcon = currentTier.icon;

  return (
    <div className="">
      {/* Current Tier Card */}
      <Card
        className={`mb-8 border-2 ${currentTier.borderColor} overflow-hidden`}
      >
        <div className={`${currentTier.color} p-6 text-white`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-full">
                <TierIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Hạng thành viên</p>
                <h2 className="text-2xl font-semibold">{currentTier.name}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Điểm tích lũy</p>
              <p className="text-2xl font-semibold">
                {userPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {nextTier && (
          <CardContent className="p-x6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Tiến độ lên hạng {nextTier.name}
              </span>
              <span className="text-sm font-medium">
                Còn {pointsToNextTier.toLocaleString()} điểm
              </span>
            </div>
            <Progress value={progressToNextTier} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{currentTier.minPoints.toLocaleString()} điểm</span>
              <span>{nextTier.minPoints.toLocaleString()} điểm</span>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Benefits */}
        <div className="lg:col-span-1 space-y-6">
          {/* Points Summary */}
          <Card className="ring-[#f1d4e0]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Thống kê điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-muted-foreground">Tổng tích được</span>
                <span className="text-lg font-semibold text-green-600">
                  +{totalEarned.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-muted-foreground">Đã sử dụng</span>
                <span className="text-lg font-semibold text-red-600">
                  -{totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-muted-foreground">Hiện có</span>
                <span className="text-lg font-semibold text-primary">
                  {userPoints.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Current Tier Benefits */}
          <Card className="ring-[#f1d4e0]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Đặc quyền hạng {currentTier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentTier.benefits.map((benefit, index) => {
                  const BenefitIcon = benefit.icon;
                  return (
                    <li key={index} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${currentTier.color}`}>
                        <BenefitIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">{benefit.text}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - History & Tiers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction History */}
          <Card className="ring-[#f1d4e0]">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Lịch sử điểm thưởng</CardTitle>
              <Button asChild variant="link" className="px-0">
                <Link to="/lich-su-diem">Xem tất cả</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between py-2"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "earn"
                            ? "bg-green-100"
                            : transaction.type === "bonus"
                              ? "bg-blue-100"
                              : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "earn" ? (
                          <TrendingUp className={`h-4 w-4 text-green-600`} />
                        ) : transaction.type === "bonus" ? (
                          <Gift className={`h-4 w-4 text-blue-600`} />
                        ) : (
                          <Gift className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        {transaction.order_total && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Giá trị đơn: {formatPrice(transaction.order_total)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`font-semibold ${
                          transaction.points > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Tiers Overview */}
          <Card className="ring-[#f1d4e0]">
            <CardHeader>
              <CardTitle className="text-lg">Các hạng thành viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {LOYALTY_TIERS.map((tier) => {
                  const TierIconComponent = tier.icon;
                  const isCurrentTier = tier.id === currentTier.id;

                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrentTier
                          ? `${tier.borderColor} bg-muted/50`
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${tier.color}`}>
                          <TierIconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${tier.textColor}`}>
                            {tier.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {tier.minPoints.toLocaleString()} -{" "}
                            {tier.maxPoints === Infinity
                              ? "∞"
                              : tier.maxPoints.toLocaleString()}{" "}
                            điểm
                          </p>
                        </div>
                        {isCurrentTier && (
                          <Badge variant="secondary" className="ml-auto">
                            Hiện tại
                          </Badge>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {benefit.text}
                          </li>
                        ))}
                        {tier.benefits.length > 3 && (
                          <li className="text-xs text-primary">
                            +{tier.benefits.length - 3} đặc quyền khác
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
