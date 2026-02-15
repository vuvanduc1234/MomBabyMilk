import axiosInstance from "@/lib/axios";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Yêu cầu thất bại.";
  throw new Error(message);
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateUserProfile = async (userId, payload) => {
  try {
    const response = await axiosInstance.patch(`/api/users/${userId}`, payload);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const changePassword = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `/api/auth/change-password`,
      payload,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post(`/api/upload/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
