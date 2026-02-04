import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Copy, Clock, CheckCircle, XCircle, Gift } from "lucide-react";
import { toast } from "sonner";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Mock data for user vouchers
const mockUserVouchers = [
  {
    id: "1",
    code: "WELCOME20",
    description: "Giảm 20% cho đơn hàng đầu tiên",
    discount_type: "percentage",
    discount_value: 20,
    min_order_value: 200000,
    max_discount: 100000,
    expires_at: "2025-03-31T23:59:59Z",
    status: "active",
    source: "Chào mừng thành viên mới",
  },
  {
    id: "2",
    code: "FREESHIP50",
    description: "Miễn phí vận chuyển cho đơn từ 300K",
    discount_type: "fixed",
    discount_value: 50000,
    min_order_value: 300000,
    max_discount: null,
    expires_at: "2025-02-28T23:59:59Z",
    status: "active",
    source: "Khuyến mãi tháng 2",
  },
  {
    id: "3",
    code: "BIRTHDAY100",
    description: "Quà sinh nhật - Giảm 100K",
    discount_type: "fixed",
    discount_value: 100000,
    min_order_value: 500000,
    max_discount: null,
    expires_at: "2025-02-10T23:59:59Z",
    status: "active",
    source: "Ưu đãi sinh nhật",
  },
  {
    id: "4",
    code: "GOLD15",
    description: "Ưu đãi thành viên Gold - Giảm 15%",
    discount_type: "percentage",
    discount_value: 15,
    min_order_value: 0,
    max_discount: 200000,
    expires_at: "2025-12-31T23:59:59Z",
    status: "active",
    source: "Đặc quyền hạng Gold",
  },
  {
    id: "5",
    code: "SALE10",
    description: "Giảm 10% toàn bộ đơn hàng",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 100000,
    max_discount: 50000,
    expires_at: "2025-01-15T23:59:59Z",
    status: "expired",
    source: "Flash sale",
  },
  {
    id: "6",
    code: "SUMMER30",
    description: "Khuyến mãi mùa hè - Giảm 30%",
    discount_type: "percentage",
    discount_value: 30,
    min_order_value: 400000,
    max_discount: 150000,
    expires_at: "2024-08-31T23:59:59Z",
    status: "used",
    used_at: "2024-08-20T14:30:00Z",
    source: "Chương trình mùa hè",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-primary hover:bg-primary/90">
          <CheckCircle className="h-3 w-3 mr-1" /> Có thể sử dụng
        </Badge>
      );
    case "used":
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" /> Đã sử dụng
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Hết hạn
        </Badge>
      );
  }
};

const VoucherCard = ({ voucher }) => {
  const isExpiringSoon = () => {
    const expiryDate = new Date(voucher.expires_at);
    const now = new Date();
    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7 && diffDays > 0;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    toast.success("Đã sao chép mã voucher!");
  };

  const isActive = voucher.status === "active";

  return (
    <Card
      className={`overflow-hidden transition-all ${!isActive ? "opacity-60" : "hover:shadow-md"} py-0`}
    >
      <div className="flex">
        {/* Left side - Discount display */}
        <div
          className={`w-32 flex flex-col items-center justify-center p-4 ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <div className="text-xs opacity-80">GIẢM</div>
          <div className="text-2xl font-bold">
            {voucher.discount_type === "percentage"
              ? `${voucher.discount_value}%`
              : formatPrice(voucher.discount_value)}
          </div>
        </div>

        {/* Right side - Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-lg">
                  {voucher.code}
                </span>
                {isActive && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyCode}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {voucher.description}
              </p>
            </div>
            {getStatusBadge(voucher.status)}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground mt-3">
            {voucher.min_order_value > 0 && (
              <p>Đơn tối thiểu: {formatPrice(voucher.min_order_value)}</p>
            )}
            {voucher.max_discount && (
              <p>Giảm tối đa: {formatPrice(voucher.max_discount)}</p>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {voucher.status === "used" && voucher.used_at ? (
                <span>Đã dùng: {formatDate(voucher.used_at)}</span>
              ) : (
                <span
                  className={
                    isExpiringSoon() ? "text-destructive font-medium" : ""
                  }
                >
                  HSD: {formatDate(voucher.expires_at)}
                  {isExpiringSoon() && " (Sắp hết hạn!)"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Nguồn: {voucher.source}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function VouchersSection() {
  const [activeTab, setActiveTab] = useState("active");

  const activeVouchers = mockUserVouchers.filter((v) => v.status === "active");
  const usedVouchers = mockUserVouchers.filter((v) => v.status === "used");
  const expiredVouchers = mockUserVouchers.filter(
    (v) => v.status === "expired",
  );

  return (
    <div className="">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="ring-[#f1d4e0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {activeVouchers.length}
              </p>
              <p className="text-sm text-muted-foreground">Có thể sử dụng</p>
            </div>
          </CardContent>
        </Card>
        <Card className="ring-[#f1d4e0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary">
              <CheckCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {usedVouchers.length}
              </p>
              <p className="text-sm text-muted-foreground">Đã sử dụng</p>
            </div>
          </CardContent>
        </Card>
        <Card className="ring-[#f1d4e0]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <XCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {expiredVouchers.length}
              </p>
              <p className="text-sm text-muted-foreground">Đã hết hạn</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Có thể dùng ({activeVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="used">
            Đã dùng ({usedVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Hết hạn ({expiredVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeVouchers.length > 0 ? (
            activeVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bạn chưa có voucher nào có thể sử dụng</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {usedVouchers.length > 0 ? (
            usedVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bạn chưa sử dụng voucher nào</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredVouchers.length > 0 ? (
            expiredVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có voucher hết hạn</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="py-0 mt-6 bg-[#f1d4e0]/10 ring-[#f1d4e0]">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">💡 Mẹo sử dụng voucher</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Áp dụng voucher tại bước thanh toán bằng cách nhập mã hoặc chọn
              từ danh sách
            </li>
            <li>• Mỗi đơn hàng chỉ được áp dụng 1 voucher</li>
            <li>• Voucher không thể hoàn lại sau khi đã sử dụng</li>
            <li>• Kiểm tra điều kiện áp dụng trước khi sử dụng</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
