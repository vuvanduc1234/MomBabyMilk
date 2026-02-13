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

export const uploadProductImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("productImage", file);

    const response = await axios.post(
      `${API_BASE}/api/upload/product-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
