import axiosInstance from "@/lib/axios";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const getAllBrands = async () => {
  try {
    const response = await axiosInstance.get("/api/brand");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
