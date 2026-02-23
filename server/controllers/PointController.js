const {
  getPointBalance,
  getPointHistory,
  redeemReward,
} = require("../services/pointService");
const RewardItem = require("../models/RewardItemModel");

const getMyPointBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const balance = await getPointBalance(userId);

    res.status(200).json({
      message: "Get point balance successfully",
      data: balance,
    });
  } catch (error) {
    console.error("Get point balance error:", error);
    res.status(500).json({
      message: "Error getting point balance",
      error: error.message,
    });
  }
};

const getMyPointHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { limit = 20, page = 1 } = req.query;

    const result = await getPointHistory(
      userId,
      parseInt(limit),
      parseInt(page),
    );

    res.status(200).json({
      message: "Get point history successfully",
      data: result.histories,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get point history error:", error);
    res.status(500).json({
      message: "Error getting point history",
      error: error.message,
    });
  }
};

const getAvailableRewards = async (req, res) => {
  try {
    const { type, minPoints, maxPoints } = req.query;

    const filter = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (minPoints || maxPoints) {
      filter.pointsCost = {};
      if (minPoints) filter.pointsCost.$gte = parseInt(minPoints);
      if (maxPoints) filter.pointsCost.$lte = parseInt(maxPoints);
    }

    filter.$or = [{ quantity: null }, { quantity: { $gt: 0 } }];

    const rewards = await RewardItem.find(filter)
      .populate("voucherId", "code discountPercentage minOrderValue expiryDate")
      .sort({ pointsCost: 1 })
      .lean();

    res.status(200).json({
      message: "Get available rewards successfully",
      data: rewards,
      total: rewards.length,
    });
  } catch (error) {
    console.error("Get available rewards error:", error);
    res.status(500).json({
      message: "Error getting available rewards",
      error: error.message,
    });
  }
};

const redeemRewardItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { rewardId } = req.params;

    const result = await redeemReward(userId, rewardId);

    res.status(200).json({
      message: result.message,
      data: {
        newBalance: result.point.balance,
        rewardItem: result.rewardItem,
        history: result.history,
      },
    });
  } catch (error) {
    console.error("Redeem reward error:", error);
    res.status(400).json({
      message: error.message || "Error redeeming points",
    });
  }
};

const createRewardItem = async (req, res) => {
  try {
    const { name, description, pointsCost, voucherId, quantity, imageUrl } =
      req.body;

    if (!name || pointsCost === undefined) {
      return res.status(400).json({
        message: "Please provide all required fields: name, pointsCost",
      });
    }

    if (!voucherId) {
      return res.status(400).json({
        message: "voucherId is required",
      });
    }

    const rewardItem = await RewardItem.create({
      name,
      description,
      type: "voucher",
      pointsCost,
      voucherId,
      quantity,
      imageUrl,
      isActive: true,
    });

    await rewardItem.populate([
      {
        path: "voucherId",
        select: "code discountPercentage minOrderValue expiryDate",
      },
    ]);

    res.status(201).json({
      message: "Reward item created successfully",
      data: rewardItem,
    });
  } catch (error) {
    console.error("Create reward item error:", error);
    res.status(500).json({
      message: "Error creating reward item",
      error: error.message,
    });
  }
};

const updateRewardItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.type;

    const rewardItem = await RewardItem.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate([
      {
        path: "voucherId",
        select: "code discountPercentage minOrderValue expiryDate",
      },
    ]);

    if (!rewardItem) {
      return res.status(404).json({ message: "Reward item not found" });
    }

    res.status(200).json({
      message: "Reward item updated successfully",
      data: rewardItem,
    });
  } catch (error) {
    console.error("Update reward item error:", error);
    res.status(500).json({
      message: "Error updating reward item",
      error: error.message,
    });
  }
};

const deleteRewardItem = async (req, res) => {
  try {
    const { id } = req.params;

    const rewardItem = await RewardItem.findByIdAndDelete(id);

    if (!rewardItem) {
      return res.status(404).json({ message: "Reward item not found" });
    }

    res.status(200).json({
      message: "Reward item deleted successfully",
      data: rewardItem,
    });
  } catch (error) {
    console.error("Delete reward item error:", error);
    res.status(500).json({
      message: "Error deleting reward item",
      error: error.message,
    });
  }
};

const getAllRewardItems = async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const rewards = await RewardItem.find(filter)
      .populate("voucherId", "code discountPercentage minOrderValue expiryDate")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Get all reward items successfully",
      data: rewards,
      total: rewards.length,
    });
  } catch (error) {
    console.error("Get all reward items error:", error);
    res.status(500).json({
      message: "Error getting reward items",
      error: error.message,
    });
  }
};

module.exports = {
  // User APIs
  getMyPointBalance,
  getMyPointHistory,
  getAvailableRewards,
  redeemRewardItem,
  // Admin APIs
  createRewardItem,
  updateRewardItem,
  deleteRewardItem,
  getAllRewardItems,
};
