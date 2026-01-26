import { useState } from 'react';
import { requestPasswordReset, resetPassword } from '../../../services/auth/forgotPassword';

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  RESET: 'reset',
  SUCCESS: 'success',
};

const normalizeErrorMessage = (message, fallbackMessage) => {
  if (!message) return fallbackMessage;

  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('network error') ||
    lowerMsg.includes('networkerror') ||
    lowerMsg.includes('fetch error') ||
    lowerMsg.includes('net::')
  ) {
    return 'Không thể kết nối máy chủ.';
  }

  if (lowerMsg.includes('timeout')) {
    return 'Kết nối bị timeout. Vui lòng thử lại.';
  }

  return message;
};

export const useForgotPasswordFlow = () => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const clearFeedback = () => {
    setError(null);
    setMessage(null);
  };

  const handleSubmitEmail = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Vui lòng nhập email.');
      return false;
    }

    setLoading(true);
    clearFeedback();

    try {
      await requestPasswordReset(normalizedEmail);
      setStep(STEPS.OTP);
      setMessage('Mã OTP đã được gửi về email của bạn.');
      return true;
    } catch (err) {
      setError(
        normalizeErrorMessage(err?.message, 'Không thể gửi mã OTP. Vui lòng thử lại.')
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return false;
    }

    if (otp.trim().length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số.');
      return false;
    }

    clearFeedback();
    setStep(STEPS.RESET);
    return true;
  };

  const handleSubmitReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return false;
    }

    setLoading(true);
    clearFeedback();

    try {
      await resetPassword({
        otp: otp.trim(),
        newPassword,
      });
      setStep(STEPS.SUCCESS);
      setMessage('Đổi mật khẩu thành công.');
      return true;
    } catch (err) {
      setError(
        normalizeErrorMessage(err?.message, 'Không thể đổi mật khẩu. Vui lòng thử lại.')
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const goToEmailStep = () => {
    clearFeedback();
    setStep(STEPS.EMAIL);
  };

  const goToOtpStep = () => {
    clearFeedback();
    setStep(STEPS.OTP);
  };

  const goToResetStep = () => {
    clearFeedback();
    setStep(STEPS.RESET);
  };

  return {
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
  };
};
