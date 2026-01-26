import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layouts/Footer';
import ForgotPasswordEmailForm from './components/ForgotPasswordEmailForm';
import ForgotPasswordOtpForm from './components/ForgotPasswordOtpForm';
import ForgotPasswordResetForm from './components/ForgotPasswordResetForm';
import ForgotPasswordSuccess from './components/ForgotPasswordSuccess';
import { useForgotPasswordFlow } from './hooks/useForgotPasswordFlow';

const STEP_CONTENT = {
  email: {
    title: 'Quên mật khẩu',
    description: 'Nhập email để nhận mã OTP đặt lại mật khẩu.',
  },
  otp: {
    title: 'Xác thực OTP',
    description: 'Nhập mã OTP được gửi về email của bạn.',
  },
  reset: {
    title: 'Đặt lại mật khẩu',
    description: 'Tạo mật khẩu mới để tiếp tục đăng nhập.',
  },
  success: {
    title: 'Hoàn tất',
    description: 'Mật khẩu của bạn đã được cập nhật.',
  },
};

function ForgotPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const statusTimerRef = useRef(null);
  const {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    message,
    handleSubmitEmail,
    handleSubmitOtp,
    handleSubmitReset,
    goToEmailStep,
    goToOtpStep,
    goToResetStep,
  } = useForgotPasswordFlow();

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

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (error) {
      showStatus({ type: 'error', message: error });
      return;
    }
    if (message) {
      showStatus({ type: 'success', message });
      return;
    }
    showStatus(null);
  }, [error, message]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const hiddenElements = [];
    const targets = document.querySelectorAll(
      'header, footer, .fixed.inset-0.pointer-events-none.overflow-hidden'
    );
    targets.forEach((element) => {
      if (!element.dataset.loginHidden) {
        element.dataset.loginHidden = 'true';
        element.classList.add('hidden');
        hiddenElements.push(element);
      }
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      hiddenElements.forEach((element) => {
        if (element.dataset.loginHidden === 'true') {
          delete element.dataset.loginHidden;
          element.classList.remove('hidden');
        }
      });
    };
  }, []);

  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  const content = useMemo(() => STEP_CONTENT[step] || STEP_CONTENT.email, [step]);

  return (
    <div className="fixed inset-0 flex flex-col items-stretch justify-start bg-[#e996b1] z-[9999] px-6 py-8 text-[#2f2730] font-['Inter','Segoe_UI',system-ui,sans-serif] overflow-y-auto min-h-screen">
      {status && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[min(520px,90%)] flex justify-center pointer-events-none z-[2]">
          <div
            className={`w-full px-[18px] py-3 rounded-[12px] text-[13px] font-semibold tracking-[0.1px] text-center border border-[rgba(255,255,255,0.12)] shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-[10px] animate-[fadeIn_0.25s_ease-out] ${
              status.type === 'success'
                ? 'bg-[#4caf50] text-[#1b5e20]'
                : 'bg-[#e53935] text-white'
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
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#8b7b84]">
            <span className="font-semibold uppercase tracking-[0.2px]">Preview:</span>
            <button
              type="button"
              onClick={goToEmailStep}
              className="rounded-full border border-[#f0dbe4] px-3 py-1 text-[11px] text-[#8b7b84] hover:text-[#2b2730]"
            >
              Email
            </button>
            <button
              type="button"
              onClick={goToOtpStep}
              className="rounded-full border border-[#f0dbe4] px-3 py-1 text-[11px] text-[#8b7b84] hover:text-[#2b2730]"
            >
              OTP
            </button>
            <button
              type="button"
              onClick={goToResetStep}
              className="rounded-full border border-[#f0dbe4] px-3 py-1 text-[11px] text-[#8b7b84] hover:text-[#2b2730]"
            >
              Reset
            </button>
          </div>
          <h1 className="text-center text-[26px] m-0 text-[#2b2730]">{content.title}</h1>
          <p className="text-center mt-2 mb-7 text-[#8b7b84] text-[14px]">
            {content.description}
          </p>

          {step === 'email' && (
            <ForgotPasswordEmailForm
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleSubmitEmail}
              loading={loading}
              error={null}
              message={null}
            />
          )}

          {step === 'otp' && (
            <ForgotPasswordOtpForm
              email={email}
              otp={otp}
              onOtpChange={setOtp}
              onSubmit={handleSubmitOtp}
              onBack={goToEmailStep}
              loading={loading}
              error={null}
            />
          )}

          {step === 'reset' && (
            <ForgotPasswordResetForm
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleSubmitReset}
              onBack={goToOtpStep}
              loading={loading}
              error={null}
            />
          )}

          {step === 'success' && <ForgotPasswordSuccess onLogin={() => navigate('/login')} />}
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

export default ForgotPassword;
