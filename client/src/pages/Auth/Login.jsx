import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layouts/Footer";
import { useAuth } from "../../context/AuthContext";

const isLoginPath = () => window.location.pathname === "/login";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isOpen, setIsOpen] = useState(isLoginPath());
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    const handlePopState = () => {
      setIsOpen(isLoginPath());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  const openLogin = () => {
    if (!isLoginPath()) {
      window.history.pushState({}, "", "/login");
    }
    setIsOpen(true);
  };

  const handleRegisterLink = (event) => {
    event.preventDefault();
    if (window.location.pathname !== "/register") {
      window.history.pushState({}, "", "/register");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const handleForgotPasswordLink = (event) => {
    event.preventDefault();
    if (window.location.pathname !== "/forgot-password") {
      window.history.pushState({}, "", "/forgot-password");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

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

  const normalizeErrorMessage = (message) => {
    if (!message) return "Không thể kết nối máy chủ.";

    const lowerMsg = message.toLowerCase();

    if (
      lowerMsg.includes("failed to fetch") ||
      lowerMsg.includes("network error") ||
      lowerMsg.includes("networkerror") ||
      lowerMsg.includes("fetch error") ||
      lowerMsg.includes("net::")
    ) {
      return "Không thể kết nối máy chủ.";
    }

    if (lowerMsg.includes("timeout")) {
      return "Kết nối bị timeout. Vui lòng thử lại.";
    }

    return message;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password" && value && !form.email.trim()) {
      showStatus({
        type: "error",
        message: "Vui lòng nhập email trước khi nhập mật khẩu.",
      });
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailInvalid = (event) => {
    const input = event.target;
    if (input.validity.valueMissing) {
      input.setCustomValidity("Vui lòng nhập email.");
    } else if (input.validity.typeMismatch) {
      input.setCustomValidity("Vui lòng nhập email hợp lệ.");
    } else {
      input.setCustomValidity("");
    }
  };

  const handlePasswordInvalid = (event) => {
    const input = event.target;
    if (input.validity.valueMissing) {
      input.setCustomValidity("Vui lòng nhập mật khẩu.");
    } else {
      input.setCustomValidity("");
    }
  };

  const handleInput = (event) => {
    event.target.setCustomValidity("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    showStatus(null);
    setLoading(true);

    try {
      if (!form.email.trim() && form.password) {
        showStatus({
          type: "error",
          message: "Vui lòng nhập email trước khi nhập mật khẩu.",
        });
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post(`/api/auth/login`, {
        email: form.email.trim(),
        password: form.password,
      });
      const { accessToken, refreshToken, user } = response?.data || {};
      if (accessToken) {
        login(accessToken, refreshToken, user);
      }

      if (user?.role === "Admin") {
        navigate("/admin");
      } else if (user?.role === "Staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      const errorMessage =
        serverMessage || error?.message || "Không thể kết nối máy chủ.";
      showStatus({
        type: "error",
        message: normalizeErrorMessage(errorMessage),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openLogin}
        className={`${
          isOpen ? "hidden" : ""
        } border-0 px-4 py-2 rounded-full text-[14px] font-semibold cursor-pointer bg-[#e996b1] text-[#2b1b24] shadow-[0_6px_14px_rgba(233,150,177,0.35)]`}
      >
        Đăng nhập
      </button>

      {isOpen && (
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
          <div className="w-full max-w-[1240px] flex items-center justify-between gap-9 px-6 mx-auto mt-[clamp(12px,10vh,15vh)] mb-10 max-[480px]:flex-col max-[480px]:items-center max-[480px]:px-0">
            <div
              className="flex-1 flex flex-col items-center gap-0 select-none -translate-x-[10%] -translate-y-[15%] scale-[1.2] origin-center"
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

            <div className="w-[420px] bg-white rounded-[16px] border border-[#f0dbe4] shadow-[0_18px_50px_rgba(41,10,24,0.08)] pt-8 px-8 pb-6 max-[480px]:w-full max-[480px]:pt-[28px] max-[480px]:px-[22px] max-[480px]:pb-[22px]">
              <h1 className="text-center text-[26px] m-0 text-[#2b2730]">
                Đăng nhập
              </h1>
              <p className="text-center mt-2 mb-7 text-[#8b7b84] text-[14px]">
                Đăng nhập để mua sắm và theo dõi đơn hàng
              </p>

              <form
                className="flex flex-col gap-[18px]"
                onSubmit={handleSubmit}
              >
                <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
                  <span className="font-medium">Email</span>
                  <span className="relative flex items-center">
                    <span className="absolute left-[14px] text-[#d1a1b7]">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                      placeholder="Nhập email của bạn"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      onInvalid={handleEmailInvalid}
                      onInput={handleInput}
                      required
                    />
                  </span>
                </label>

                <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
                  <span className="font-medium">Mật khẩu</span>
                  <span className="relative flex items-center">
                    <span className="absolute left-[14px] text-[#d1a1b7]">
                      <LockIcon />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      onInvalid={handlePasswordInvalid}
                      onInput={handleInput}
                      required
                    />
                    <button
                      className="absolute right-[12px] bg-transparent border-0 text-[#c78ea6] cursor-pointer p-1"
                      type="button"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      onClick={togglePassword}
                    >
                      <EyeIcon isOpen={showPassword} />
                    </button>
                  </span>
                </label>

                <div className="text-right text-[13px]">
                  <a
                    className="text-[#8b7b84] hover:underline"
                    href="/forgot-password"
                    onClick={handleForgotPasswordLink}
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  className="h-[44px] rounded-[12px] border-0 bg-[#e996b1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              <div className="mt-5 text-center text-[13px] text-[#7e6b75]">
                Chưa có tài khoản?{" "}
                <a
                  className="text-[#e996b1] no-underline font-semibold hover:underline"
                  href="/register"
                  onClick={handleRegisterLink}
                >
                  Đăng ký ngay
                </a>
              </div>
            </div>
          </div>
          <div className="w-[calc(100%+48px)] bg-white -mx-6 -mb-8 mt-auto pt-[3.25vh] [&_footer]:!block [&_footer]:!bg-white [&_footer]:text-[#2f2730] [&_footer.bg-gray-900]:!bg-white [&_footer_.bg-gray-950]:!bg-white [&_footer_.text-gray-300]:!text-[#5f4c55] [&_footer_.text-gray-400]:!text-[#5f4c55] [&_footer_.text-gray-500]:!text-[#5f4c55] [&_footer_.text-white]:!text-[#2f2730] [&_footer_a]:text-[#2f2730] [&_footer_a:hover]:text-[#2f2730] [&_footer_.border-gray-800]:!border-[#e8dfe3] [&_footer_.border-gray-700]:!border-[#e8dfe3] [&_footer_input]:!bg-white [&_footer_input]:!text-[#2f2730] [&_footer_input]:!border-[#e8dfe3] [&_footer_button]:!bg-[#e996b1] [&_footer_button]:!text-white">
            <Footer />
          </div>
        </div>
      )}

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
    </>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-[18px] h-[18px] fill-current"
    >
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-[18px] h-[18px] fill-current"
    >
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4z" />
    </svg>
  );
}

function EyeIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-[18px] h-[18px] fill-current"
    >
      {isOpen ? (
        <path d="M12 4.5c-5.6 0-10.3 3.5-12 7.5 1.7 4 6.4 7.5 12 7.5s10.3-3.5 12-7.5c-1.7-4-6.4-7.5-12-7.5zm0 12.2a4.7 4.7 0 1 1 0-9.4 4.7 4.7 0 0 1 0 9.4z" />
      ) : (
        <path d="M2.3 3.7 1 5l3.3 3.3C2.6 9.7 1.4 11.6 1 12c1.7 4 6.4 7.5 12 7.5 2 0 3.9-.4 5.6-1.2l3.1 3.1 1.3-1.3-20-20zm9.7 12.9a4.7 4.7 0 0 1-4.7-4.7c0-.6.1-1.1.3-1.6l6 6c-.5.2-1 .3-1.6.3zm2.9-1 2.9 2.9c-1.7.8-3.6 1.2-5.8 1.2-4.4 0-8.3-2.6-9.9-6.2.8-1.7 2-3.1 3.5-4.2l2.1 2.1a4.7 4.7 0 0 0 7.2 6.2zM12 6.3c4.4 0 8.3 2.6 9.9 6.2-.7 1.4-1.6 2.6-2.7 3.5l-1.8-1.8a4.7 4.7 0 0 0-5.6-5.6L9 6.7c1-.3 2-.4 3-.4z" />
      )}
    </svg>
  );
}

export default Login;
