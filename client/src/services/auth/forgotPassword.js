const API_BASE = window.__API_BASE__ || 'http://localhost:5000';

const request = async (path, payload) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Yêu cầu thất bại. Vui lòng thử lại.';
    throw new Error(message);
  }

  return data;
};

export const requestPasswordReset = (email) => request('/auth/forget-password', { email });

export const resetPassword = ({ otp, newPassword }) =>
  request('/auth/reset-password', {
    token: otp,
    newPassword,
  });
