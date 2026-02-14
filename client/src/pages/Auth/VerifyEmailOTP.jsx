import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import Footer from "../../components/layouts/Footer";

function VerifyEmailOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    // Lấy email từ location state hoặc query params
    const emailFromState = location.state?.email;
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");

    const userEmail = emailFromState || emailFromQuery;

    if (!userEmail) {
      // Nếu không có email, redirect về register
      navigate("/register");
      return;
    }

    setEmail(userEmail);
  }, [location, navigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hiddenElements = [];
    const targets = document.querySelectorAll(
      "header, footer, .fixed.inset-0.pointer-events-none.overflow-hidden",
    );
    targets.forEach((element) => {
      if (!element.dataset.loginHidden) {
        element.dataset.loginHidden = "true";
        element.classList.add("hidden");
        hiddenElements.push(element);
      }
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      hiddenElements.forEach((element) => {
        if (element.dataset.loginHidden === "true") {
          delete element.dataset.loginHidden;
          element.classList.remove("hidden");
        }
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const showStatus = (nextStatus, durationMs = 3500) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    setStatus(nextStatus);
    if (nextStatus) {
      statusTimerRef.current = setTimeout(() => {
        setStatus(null);
      }, durationMs);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await axiosInstance.post(`/api/auth/verify-email`, {
        email: email.trim(),
        otp: otp.trim(),
      });

      showStatus({
        type: "success",
        message: "Xác thực thành công! Đang chuyển đến trang chủ...",
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      const errorMessage =
        serverMessage || error?.message || "Không thể xác thực OTP.";
      showStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setStatus(null);
    setResendLoading(true);

    try {
      await axiosInstance.post(`/api/auth/send-reset-otp`, {
        email: email.trim(),
      });

      showStatus({
        type: "success",
        message: "Đã gửi lại mã OTP. Vui lòng kiểm tra email.",
      });
    } catch (error) {
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      const errorMessage =
        serverMessage || error?.message || "Không thể gửi lại OTP.";
      showStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpInvalid = (event) => {
    const input = event.target;
    if (input.validity.valueMissing) {
      input.setCustomValidity("Vui lòng nhập mã OTP.");
    } else {
      input.setCustomValidity("");
    }
  };

  const handleInput = (event) => {
    event.target.setCustomValidity("");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-stretch justify-start bg-[#e996b1] z-[9999] px-6 py-8 text-[#2f2730] font-['Inter','Segoe_UI',system-ui,sans-serif] overflow-y-auto min-h-screen">
      {status && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[min(520px,90%)] flex justify-center pointer-events-none z-[2]">
          <div
            className={`w-full px-[18px] py-3 rounded-[12px] text-[13px] font-semibold tracking-[0.1px] text-center border border-[rgba(255,255,255,0.12)] shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-[10px] animate-[fadeIn_0.25s_ease-out] ${
              status.type === "success"
                ? "bg-[#4caf50] text-[#1b5e20]"
                : "bg-[#e53935] text-white"
            }`}
          >
            {status.message}
          </div>
        </div>
      )}

      <div className="w-full max-w-[1240px] flex items-center justify-between gap-9 px-6 mx-auto mt-[clamp(12px,7.225vh,10.8375vh)] mb-10 max-[480px]:flex-col max-[480px]:items-center max-[480px]:px-0">
        <div
          className="flex-1 flex flex-col items-center gap-0 select-none -translate-x-[10%] -translate-y-[25%] scale-[1.2] origin-center max-[480px]:-translate-y-[10%] max-[480px]:scale-[1.05]"
          aria-hidden="true"
        >
          <img
            className="w-[406px] h-[406px] block object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            src="/LogoLogin.png"
            alt=""
          />
          <img
            className="w-[420px] max-w-full h-auto mt-[-80px] select-none max-[480px]:w-[240px]"
            src="/nura-logo-white.svg"
            alt="NURA MOM & BABY MILK"
          />
        </div>

        <div className="w-[420px] bg-white rounded-[16px] border border-[#f0dbe4] shadow-[0_18px_50px_rgba(41,10,24,0.08)] pt-8 px-8 pb-6 mt-[-5%] max-[480px]:w-full max-[480px]:pt-[28px] max-[480px]:px-[22px] max-[480px]:pb-[22px] max-[480px]:mt-0">
          <h1 className="text-center text-[26px] m-0 text-[#2b2730]">
            Xác thực Email
          </h1>
          <p className="text-center mt-2 mb-7 text-[#8b7b84] text-[14px]">
            Nhập mã OTP được gửi đến <strong>{email}</strong>
          </p>

          <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
              <span className="font-medium">Mã OTP</span>
              <input
                type="text"
                name="otp"
                className="w-full h-[44px] px-[14px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                placeholder="Nhập mã OTP (6 chữ số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onInvalid={handleOtpInvalid}
                onInput={handleInput}
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </label>

            <button
              className="h-[44px] rounded-[12px] border-0 bg-[#e996b1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </form>

          <div className="mt-5 text-center text-[13px] text-[#7e6b75]">
            Không nhận được mã?{" "}
            <button
              className="text-[#e996b1] no-underline font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResendOTP}
              disabled={resendLoading || loading}
            >
              {resendLoading ? "Đang gửi..." : "Gửi lại OTP"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-[calc(100%+48px)] bg-white -mx-6 -mb-8 mt-auto pt-[3.25vh] [&_footer]:!block [&_footer]:!bg-white [&_footer]:text-[#2f2730] [&_footer.bg-gray-900]:!bg-white [&_footer_.bg-gray-950]:!bg-white [&_footer_.text-gray-300]:!text-[#5f4c55] [&_footer_.text-gray-400]:!text-[#5f4c55] [&_footer_.text-gray-500]:!text-[#5f4c55] [&_footer_.text-white]:!text-[#2f2730] [&_footer_a]:text-[#2f2730] [&_footer_a:hover]:text-[#2f2730] [&_footer_.border-gray-800]:!border-[#e8dfe3] [&_footer_.border-gray-700]:!border-[#e8dfe3] [&_footer_input]:!bg-white [&_footer_input]:!text-[#2f2730] [&_footer_input]:!border-[#e8dfe3] [&_footer_button]:!bg-[#e996b1] [&_footer_button]:!text-white">
        <Footer />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmailOTP;
