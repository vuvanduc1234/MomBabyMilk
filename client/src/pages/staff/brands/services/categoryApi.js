import axiosInstance from "@/lib/axios";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get("/api/category");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/category/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post("/api/category", categoryData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.patch(
      `/api/category/${id}`,
      categoryData,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/category/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
