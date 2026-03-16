// src/pages/PaymentResult.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { getOrderById } from "../services/orderService";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [countdown, setCountdown] = useState(5);
  const [resolvedStatus, setResolvedStatus] = useState("pending");
  const hasClearedRef = useRef(false);
  const hasNotifiedRef = useRef(false);

  // Parse params từ URL (hỗ trợ cả MoMo và VNPay)
  let status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const message = searchParams.get("message");

  // MoMo params
  const momoResultCode = searchParams.get("resultCode");
  const momoOrderId = searchParams.get("orderId");
  const momoAmount = searchParams.get("amount");

  // VNPay params
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");

  // Xác định status từ các payment gateway
  if (!status) {
    if (momoResultCode === "0") {
      status = "success";
    } else if (momoResultCode && momoResultCode !== "0") {
      status = "error";
    } else if (vnpResponseCode === "00") {
      status = "success";
    } else if (vnpResponseCode && vnpResponseCode !== "00") {
      status = "error";
    }
  }

  // Lấy orderId và amount từ các nguồn khác nhau
  const finalOrderId = orderId || momoOrderId || vnpTxnRef;
  const finalAmount =
    amount || momoAmount || (vnpAmount ? parseInt(vnpAmount) / 100 : null);

  const gatewayStatus = status;

  // Ưu tiên backend state thay vì chỉ tin query param từ gateway.
  useEffect(() => {
    let isCancelled = false;

    const verifyOrderStatus = async () => {
      if (!finalOrderId) {
        setResolvedStatus(gatewayStatus === "error" ? "error" : "pending");
        return;
      }

      try {
        const response = await getOrderById(finalOrderId);
        const order = response?.order;

        if (!order) {
          setResolvedStatus(gatewayStatus === "error" ? "error" : "pending");
          return;
        }

        if (order.paymentStatus === "paid") {
          if (!isCancelled) setResolvedStatus("success");
          return;
        }

        if (order.paymentStatus === "failed") {
          if (!isCancelled) setResolvedStatus("error");
          return;
        }

        if (!isCancelled) {
          setResolvedStatus("pending");
        }
      } catch {
        if (!isCancelled) {
          setResolvedStatus(gatewayStatus === "error" ? "error" : "pending");
        }
      }
    };

    verifyOrderStatus();

    return () => {
      isCancelled = true;
    };
  }, [finalOrderId, gatewayStatus]);

  // Clear cart đúng 1 lần khi đã có orderId (đơn đã được tạo trên hệ thống).
  useEffect(() => {
    if (finalOrderId && !hasClearedRef.current) {
      hasClearedRef.current = true;
      clearCart();
    }
  }, [finalOrderId, clearCart]);

  // Hiển thị toast đúng 1 lần sau khi backend resolve trạng thái.
  useEffect(() => {
    if (hasNotifiedRef.current) return;
    if (resolvedStatus === "success") {
      hasNotifiedRef.current = true;
      toast.success("Đặt hàng thành công!");
      return;
    }
    if (resolvedStatus === "error") {
      hasNotifiedRef.current = true;
      toast.info(
        "Đơn hàng đã được tạo. Bạn có thể thử lại thanh toán ở trang theo dõi đơn hàng.",
      );
    }
  }, [resolvedStatus]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/track-order");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (resolvedStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>

          {finalOrderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm font-semibold">
                  {finalOrderId}
                </span>
              </div>
              {finalAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-green-600">
                    {formatVND(parseFloat(finalAmount))}
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            Tự động chuyển hướng sau {countdown} giây...
          </p>

          <button
            onClick={() => navigate("/track-order")}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            Theo dõi đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (resolvedStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán thất bại!
          </h1>
          <p className="text-gray-600 mb-6">
            {message || "Đã có lỗi xảy ra trong quá trình thanh toán."}
          </p>

          <p className="text-sm text-gray-500 mb-4">
            Tự động chuyển hướng sau {countdown} giây...
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/track-order")}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
            >
              Theo dõi đơn hàng
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default or unknown status
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý...</h1>
        <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát.</p>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
