import axiosInstance from "@/lib/axios";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const uploadBrandImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("brandLogo", file);

    const response = await axiosInstance.post(
      "/api/upload/brand-logo",
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

export const getAllBrands = async () => {
  try {
    const response = await axiosInstance.get("/api/brand");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getBrandById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/brand/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createBrand = async (brandData) => {
  try {
    const response = await axiosInstance.post("/api/brand", brandData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateBrand = async (id, brandData) => {
  try {
    const response = await axiosInstance.patch(`/api/brand/${id}`, brandData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/brand/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
