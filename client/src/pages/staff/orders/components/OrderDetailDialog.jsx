import { Gift, Save, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  formatOrderNumber,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPaymentMethodLabel,
  getItemStatusLabel,
  formatVND,
  updateOrderMetadata,
} from "@/pages/staff/orders/services/orderService";

// Format helpers
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function OrderDetailDialog({
  selectedOrder,
  onClose,
  internalNote,
  setInternalNote,
  onOrderUpdated,
}) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveMetadata = async () => {
    if (!selectedOrder) return;

    setIsSaving(true);
    try {
      await updateOrderMetadata(selectedOrder._id, {
        note: internalNote,
      });
      toast.success("Đã lưu thông tin đơn hàng");
      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (error) {
      console.error("Failed to save order metadata:", error);
      toast.error(error.message || "Không thể lưu thông tin đơn hàng");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate order breakdown
  const calculateOrderBreakdown = () => {
    if (!selectedOrder?.cartItems)
      return { subtotal: 0, discount: 0, shippingFee: 0 };

    const subtotal = selectedOrder.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Calculate discount from rewards
    const rewardDiscount = selectedOrder.rewardPointsUsed || 0;

    // If there's a voucher, calculate its discount
    let voucherDiscount = 0;
    if (selectedOrder.voucherUsed?.discountPercentage) {
      voucherDiscount =
        subtotal * (selectedOrder.voucherUsed.discountPercentage / 100);
    }

    const totalDiscount = rewardDiscount + voucherDiscount;
    const shippingFee = Math.max(
      0,
      selectedOrder.totalAmount - (subtotal - totalDiscount),
    );

    return {
      subtotal,
      discount: totalDiscount,
      shippingFee:
        subtotal - totalDiscount + shippingFee === selectedOrder.totalAmount
          ? shippingFee
          : 0,
    };
  };

  const orderBreakdown = selectedOrder
    ? calculateOrderBreakdown()
    : { subtotal: 0, discount: 0, shippingFee: 0 };

  return (
    <Dialog open={!!selectedOrder} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto lg:overflow-y-clip scrollbar-thin sm:mx-4">
        <DialogHeader>
          <DialogTitle>
            Chi tiết đơn hàng{" "}
            {selectedOrder && formatOrderNumber(selectedOrder)}
          </DialogTitle>
        </DialogHeader>
        {selectedOrder && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-6 flex flex-col lg:justify-between">
              {/* Customer Info */}
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 border-b pb-6">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                    <p>
                      <strong>
                        {selectedOrder.customer?.fullname || "N/A"}
                      </strong>
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.phone ||
                        selectedOrder.customer?.phone ||
                        "N/A"}
                    </p>
                    {selectedOrder.customer?.email && (
                      <p className="text-muted-foreground">
                        {selectedOrder.customer.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                    <p className="text-muted-foreground">
                      {selectedOrder.shippingAddress || "N/A"}
                    </p>
                  </div>
                </div>
                {selectedOrder.note && (
                  <div>
                    <h4 className="font-medium mb-1">Ghi chú khách hàng</h4>
                    <p className="text-muted-foreground">
                      {selectedOrder.note}
                    </p>
                  </div>
                )}

                {/* Pre-order Info */}
                {selectedOrder.cartItems?.some((item) => item.isPreOrder) && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Gift className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">
                      Đơn hàng có sản phẩm đặt trước
                    </AlertTitle>
                    <AlertDescription className="text-blue-800">
                      Đơn hàng này có chứa sản phẩm đặt trước. Vui lòng kiểm tra
                      ngày dự kiến.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Staff Actions */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Thao tác nhân viên</h4>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú nội bộ</Label>
                  <Textarea
                    id="note"
                    placeholder="Ghi chú nội bộ..."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 lg:flex-row flex-col">
                  <Button
                    size="sm"
                    onClick={handleSaveMetadata}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thông tin
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Staff không thể chỉnh sửa giá, thanh toán hoặc hoàn tiền.
                  Liên hệ Admin nếu cần.
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-6 flex flex-col">
              <div>
                <h4 className="font-medium lg:mb-2">Sản phẩm</h4>
                <div className="space-y-2 overflow-y-auto lg:max-h-110 scrollbar-thin -mr-2 pr-2">
                  {selectedOrder.cartItems?.map((item, index) => (
                    <div key={index} className="flex gap-3 py-2 border-b">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.imageUrl || item.product?.imageUrl ? (
                          <img
                            src={
                              Array.isArray(item.imageUrl)
                                ? item.imageUrl[0]
                                : item.imageUrl ||
                                  (Array.isArray(item.product?.imageUrl)
                                    ? item.product.imageUrl[0]
                                    : item.product?.imageUrl)
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-full h-full p-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          {item.isPreOrder && (
                            <Badge variant="outline" className="text-xs">
                              <Gift className="h-3 w-3 mr-1" />
                              Đặt trước
                            </Badge>
                          )}
                        </div>
                        {item.itemStatus && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Trạng thái: {getItemStatusLabel(item.itemStatus)}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVND(orderBreakdown.subtotal)}</span>
                </div>
                {orderBreakdown.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{formatVND(orderBreakdown.shippingFee)}</span>
                  </div>
                )}
                {orderBreakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatVND(orderBreakdown.discount)}</span>
                  </div>
                )}
                {selectedOrder.rewardPointsUsed > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Điểm thưởng</span>
                    <span>-{formatVND(selectedOrder.rewardPointsUsed)}</span>
                  </div>
                )}
                {selectedOrder.voucherUsed && (
                  <div className="flex justify-between text-purple-600">
                    <span>Voucher ({selectedOrder.voucherUsed.code})</span>
                    <span>
                      -{selectedOrder.voucherUsed.discountPercentage}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatVND(selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex items-end flex-col text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Thanh toán: </span>
                    <span>
                      {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Trạng thái TT:{" "}
                    </span>
                    <span
                      className={getPaymentStatusColor(
                        selectedOrder.paymentStatus,
                      )}
                    >
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày đặt: </span>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
