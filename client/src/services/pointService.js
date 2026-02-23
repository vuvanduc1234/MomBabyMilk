import axiosInstance from "../lib/axios";

// ==================== USER APIs ====================

/**
 * Get current user's point balance
 */
export const getMyPointBalance = async () => {
  try {
    const response = await axiosInstance.get("/api/points/balance");
    return response.data;
  } catch (error) {
    console.error("Error fetching point balance:", error);
    throw error;
  }
};

/**
 * Get current user's point history with pagination
 */
export const getMyPointHistory = async (limit = 20, page = 1) => {
  try {
    const response = await axiosInstance.get("/api/points/history", {
      params: { limit, page },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching point history:", error);
    throw error;
  }
};

/**
 * Get available rewards for redemption
 */
export const getAvailableRewards = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/api/points/rewards", {
      params: filters, // { type, minPoints, maxPoints }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    throw error;
  }
};

/**
 * Redeem a reward item (exchange points for voucher)
 */
export const redeemReward = async (rewardId) => {
  try {
    const response = await axiosInstance.post(
      `/api/points/rewards/${rewardId}/redeem`,
    );
    return response.data;
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================

/**
 * Get all reward items (Admin only)
 */
export const getAllRewardItems = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/api/points/admin/rewards", {
      params: filters, // { type, isActive }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    throw error;
  }
};

/**
 * Create a new reward item (Admin only)
 */
export const createRewardItem = async (rewardData) => {
  try {
    const response = await axiosInstance.post(
      "/api/points/admin/rewards",
      rewardData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating reward item:", error);
    throw error;
  }
};

/**
 * Update a reward item (Admin only)
 */
export const updateRewardItem = async (rewardId, updateData) => {
  try {
    const response = await axiosInstance.put(
      `/api/points/admin/rewards/${rewardId}`,
      updateData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating reward item:", error);
    throw error;
  }
};

/**
 * Delete a reward item (Admin only)
 */
export const deleteRewardItem = async (rewardId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/points/admin/rewards/${rewardId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting reward item:", error);
    throw error;
  }
};
