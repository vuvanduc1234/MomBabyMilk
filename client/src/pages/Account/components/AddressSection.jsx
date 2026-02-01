import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const buildHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const fetchUserProfile = async (userId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/api/users/${userId}`, {
      headers: buildHeaders(token),
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateUserProfile = async (userId, payload, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/api/users/${userId}`,
      payload,
      { headers: buildHeaders(token) }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const changePassword = async (payload, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/auth/change-password`,
      payload,
      { headers: buildHeaders(token) }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
