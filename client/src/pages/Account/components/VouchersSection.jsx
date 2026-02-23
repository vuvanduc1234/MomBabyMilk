import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Gift,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getUserVouchers } from "../services/accountApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice, formatDate } from "@/lib/formatters";

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
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserVouchers();

      // Transform API data to match component structure
      const transformedVouchers = (response.vouchers || []).map((item) => ({
        id: item.voucherId._id,
        code: item.voucherId.code,
        description:
          item.voucherId.description ||
          `Voucher giảm giá ${item.voucherId.code}`,
        discount_type: item.voucherId.discountPercentage
          ? "percentage"
          : "fixed",
        discount_value:
          item.voucherId.discountPercentage ||
          item.voucherId.discountAmount ||
          0,
        min_order_value: item.voucherId.minOrderValue || 0,
        max_discount: item.voucherId.maxDiscount || null,
        expires_at: item.voucherId.expiryDate,
        status: "active", // API only returns valid vouchers
        source: item.source || "Đổi điểm",
        quantity: item.quantity,
      }));

      setVouchers(transformedVouchers);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setError(err.message || "Không thể tải voucher");
    } finally {
      setLoading(false);
    }
  };

  const activeVouchers = vouchers.filter((v) => v.status === "active");
  const usedVouchers = vouchers.filter((v) => v.status === "used");
  const expiredVouchers = vouchers.filter((v) => v.status === "expired");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
