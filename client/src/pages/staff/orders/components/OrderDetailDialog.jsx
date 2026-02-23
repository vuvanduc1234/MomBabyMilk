import { Gift, Package, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  formatOrderNumber,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPaymentMethodLabel,
  getItemStatusLabel,
  formatVND,
  updateItemStatus,
  notifyPreOrderReady,
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
  onOrderUpdate,
}) {
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

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

  // Handler: Update item status
  const handleUpdateItemStatus = async (itemIndex, newStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingItem(true);
    try {
      await updateItemStatus(selectedOrder._id, itemIndex, newStatus);
      toast.success("Đã cập nhật trạng thái sản phẩm");

      // Update the order locally
      const updatedOrder = {
        ...selectedOrder,
        cartItems: selectedOrder.cartItems.map((item, idx) =>
          idx === itemIndex ? { ...item, itemStatus: newStatus } : item,
        ),
      };

      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái sản phẩm");
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // Handler: Notify pre-order ready
  const handleNotifyPreOrderReady = async () => {
    if (!selectedOrder) return;
    setIsNotifying(true);
    try {
      await notifyPreOrderReady(selectedOrder._id);
      toast.success("Đã gửi thông báo cho khách hàng");
    } catch (err) {
      toast.error(err.message || "Không thể gửi thông báo");
    } finally {
      setIsNotifying(false);
    }
  };

  // Check if order has pre-order items that are ready
  const hasReadyPreOrderItems = selectedOrder?.cartItems?.some(
    (item) => item.isPreOrder && item.itemStatus === "preorder_ready",
  );

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
                    <AlertDescription className="text-blue-800 space-y-2">
                      <p>
                        Đơn hàng này có chứa sản phẩm đặt trước. Vui lòng kiểm
                        tra ngày dự kiến.
                      </p>
                      {hasReadyPreOrderItems && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={handleNotifyPreOrderReady}
                          disabled={isNotifying}
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          {isNotifying ? "Đang gửi..." : "Thông báo hàng đã về"}
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
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
                      <div className="flex-1 space-y-1">
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
                        {item.isPreOrder && (
                          <p className="text-xs text-blue-600">
                            {item.expectedAvailableDate ? (
                              <>
                                Dự kiến:{" "}
                                {formatDateTime(item.expectedAvailableDate)}
                              </>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Chưa có ngày dự kiến
                              </span>
                            )}
                          </p>
                        )}
                        {item.itemStatus && (
                          <Select
                            value={item.itemStatus}
                            onValueChange={(value) =>
                              handleUpdateItemStatus(index, value)
                            }
                            disabled={isUpdatingItem}
                          >
                            <SelectTrigger className="h-7 text-xs w-full max-w-[180px]">
                              <SelectValue>
                                {getItemStatusLabel(item.itemStatus)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Có sẵn</SelectItem>
                              <SelectItem value="preorder_pending">
                                Đặt trước - Chờ hàng
                              </SelectItem>
                              <SelectItem value="preorder_ready">
                                Đặt trước - Đã có hàng
                              </SelectItem>
                              <SelectItem value="shipped">Đã giao</SelectItem>
                            </SelectContent>
                          </Select>
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
