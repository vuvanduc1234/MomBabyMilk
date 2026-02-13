const Reward = require("../models/RewardModel");

const getOrCreateReward = async (userId) => {
  let reward = await Reward.findOne({ user: userId });
  if (!reward) {
    reward = await Reward.create({ user: userId, balance: 0, transactions: [] });
  }
  return reward;
};

const calculateRewardPoints = (orderTotal) => {
  if (orderTotal < 100000) return 20;
  if (orderTotal <= 500000) return 50;
  return 100;
};

const addRewardPoints = async (userId, amount, reason = "Mua hàng thành công", meta = {}) => {
  const reward = await getOrCreateReward(userId);
  reward.balance += amount;
  reward.transactions.push({
    type: "earn",
    amount,
    reason,
    meta,
  });
  await reward.save();
  return reward;
};

const redeemRewardPoints = async (userId, amount, reason = "Sử dụng xu thanh toán", meta = {}) => {
  const reward = await getOrCreateReward(userId);
  
  if (reward.balance < amount) {
    throw new Error("Không đủ xu");
  }
  
  reward.balance -= amount;
  reward.transactions.push({
    type: "redeem",
    amount,
    reason,
    meta,
  });
  await reward.save();
  return reward;
};

const getRewardBalance = async (userId) => {
  const reward = await getOrCreateReward(userId);
  return reward.balance;
};

const getRewardHistory = async (userId, limit = 20) => {
  const reward = await Reward.findOne({ user: userId })
    .select("balance transactions")
    .lean();
  
  if (!reward) {
    return { balance: 0, transactions: [] };
  }
  
  const transactions = reward.transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  
  return {
    balance: reward.balance,
    transactions,
  };
};

module.exports = {
  getOrCreateReward,
  calculateRewardPoints,
  addRewardPoints,
  redeemRewardPoints,
  getRewardBalance,
  getRewardHistory,
};
