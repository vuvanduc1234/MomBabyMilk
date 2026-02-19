import axiosInstance from "@/lib/axios";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("productImage", file);

    const response = await axiosInstance.post(
      "/api/upload/product-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
