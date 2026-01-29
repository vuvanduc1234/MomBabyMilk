import axios from "axios";

const API_BASE = "http://localhost:3000";

const request = async (path, payload) => {
  try {
    const response = await axios.post(`${API_BASE}${path}`, payload);
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Yêu cầu thất bại. Vui lòng thử lại.";
    throw new Error(message);
  }
};

export const requestPasswordReset = (email) =>
  request("/api/auth/forget-password", { email });

export const resetPassword = ({ otp, newPassword }) =>
  request("/api/auth/reset-password", {
    token: otp,
    newPassword,
  });
