const Point = require('../models/PointModel');
const PointHistory = require('../models/PointHistoryModel');
const RewardItem = require('../models/RewardItemModel');
const User = require('../models/UserModel');
const Voucher = require('../models/VoucherModel');
const mongoose = require('mongoose');

const getOrCreatePoint = async (userId) => {
  let point = await Point.findOne({ user: userId });
  if (!point) {
    point = await Point.create({
      user: userId,
      balance: 0,
      pendingPoints: 0,
      totalEarned: 0,
      totalSpent: 0,
    });
  }
  return point;
};

const calculatePointsFromOrder = (orderTotal) => {
  return Math.floor(orderTotal * 0.01);
};

const addPendingPoints = async (userId, orderId, orderTotal, session = null) => {
  const points = calculatePointsFromOrder(orderTotal);
  if (points <= 0) return null;

  const point = await getOrCreatePoint(userId);
  const balanceBefore = point.balance;

  point.pendingPoints += points;
  await point.save({ session });

  const history = await PointHistory.create(
    [
      {
        user: userId,
        type: 'earn',
        amount: points,
        status: 'pending',
        reason: 'Order placed (pending delivery)',
        relatedOrder: orderId,
        balanceBefore,
        balanceAfter: balanceBefore,
        meta: { orderTotal },
      },
    ],
    { session }
  );

  return { point, history: history[0], pointsEarned: points };
};

const confirmPendingPoints = async (userId, orderId, session = null) => {
  const point = await Point.findOne({ user: userId }).session(session);
  if (!point) return null;

  const pendingHistory = await PointHistory.findOne({
    user: userId,
    relatedOrder: orderId,
    type: 'earn',
    status: 'pending',
  }).session(session);

  if (!pendingHistory) return null;

  const amount = pendingHistory.amount;
  const balanceBefore = point.balance;

  point.pendingPoints -= amount;
  point.balance += amount;
  point.totalEarned += amount;
  await point.save({ session });

  pendingHistory.status = 'confirmed';
  pendingHistory.balanceAfter = point.balance;
  pendingHistory.reason = 'Order delivered successfully';
  await pendingHistory.save({ session });

  return { point, pointsConfirmed: amount };
};

const cancelPendingPoints = async (userId, orderId, session = null) => {
  const point = await Point.findOne({ user: userId }).session(session);
  if (!point) return null;

  const pendingHistory = await PointHistory.findOne({
    user: userId,
    relatedOrder: orderId,
    type: 'earn',
    status: 'pending',
  }).session(session);

  if (!pendingHistory) return null;

  const amount = pendingHistory.amount;

  point.pendingPoints -= amount;
  await point.save({ session });

  pendingHistory.status = 'cancelled';
  pendingHistory.reason = 'Order cancelled';
  await pendingHistory.save({ session });

  return { point, pointsCancelled: amount };
};

const refundPoints = async (userId, orderId, session = null) => {
  const point = await Point.findOne({ user: userId }).session(session);
  if (!point) return null;

  const confirmedHistory = await PointHistory.findOne({
    user: userId,
    relatedOrder: orderId,
    type: 'earn',
    status: 'confirmed',
  }).session(session);

  if (!confirmedHistory) return null;

  const amount = confirmedHistory.amount;
  const balanceBefore = point.balance;

  point.balance = Math.max(0, point.balance - amount);
  point.totalEarned = Math.max(0, point.totalEarned - amount);
  await point.save({ session });

  const refundHistory = await PointHistory.create(
    [
      {
        user: userId,
        type: 'refund',
        amount: -amount,
        status: 'confirmed',
        reason: 'Order refunded',
        relatedOrder: orderId,
        balanceBefore,
        balanceAfter: point.balance,
      },
    ],
    { session }
  );

  return { point, pointsRefunded: amount, history: refundHistory[0] };
};

const redeemReward = async (userId, rewardItemId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const point = await Point.findOne({ user: userId }).session(session);
    if (!point) {
      throw new Error('Point account not found');
    }

    const rewardItem = await RewardItem.findById(rewardItemId).session(session);
    if (!rewardItem) {
      throw new Error('Reward item not found');
    }

    if (!rewardItem.isActive) {
      throw new Error('Reward item is not available');
    }

    if (rewardItem.quantity !== null && rewardItem.quantity <= 0) {
      throw new Error('Reward item is out of stock');
    }

    if (point.balance < rewardItem.pointsCost) {
      throw new Error(
        `Insufficient points. You need ${rewardItem.pointsCost} points but only have ${point.balance} points`
      );
    }

    const balanceBefore = point.balance;

    point.balance -= rewardItem.pointsCost;
    point.totalSpent += rewardItem.pointsCost;
    await point.save({ session });

    if (rewardItem.quantity !== null) {
      rewardItem.quantity -= 1;
    }
    rewardItem.totalRedeemed += 1;
    await rewardItem.save({ session });

    const history = await PointHistory.create(
      [
        {
          user: userId,
          type: 'redeem',
          amount: -rewardItem.pointsCost,
          status: 'confirmed',
          reason: `Redeemed points for voucher: ${rewardItem.name}`,
          relatedReward: rewardItemId,
          balanceBefore,
          balanceAfter: point.balance,
          meta: {
            rewardType: 'voucher',
            rewardName: rewardItem.name,
            voucherId: rewardItem.voucherId,
          },
        },
      ],
      { session }
    );

    const user = await User.findById(userId).session(session);
    if (user) {
      const existingVoucher = user.userVouchers.find(
        (v) => v.voucherId.toString() === rewardItem.voucherId.toString()
      );

      if (existingVoucher) {
        existingVoucher.quantity += 1;
      } else {
        user.userVouchers.push({
          voucherId: rewardItem.voucherId,
          quantity: 1,
        });
      }
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      point,
      rewardItem,
      history: history[0],
      message: 'Points redeemed successfully',
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getPointHistory = async (userId, limit = 20, page = 1) => {
  const skip = (page - 1) * limit;
  
  const [histories, total] = await Promise.all([
    PointHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedOrder', 'orderStatus totalAmount')
      .populate('relatedReward', 'name type')
      .lean(),
    PointHistory.countDocuments({ user: userId }),
  ]);

  return {
    histories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPointBalance = async (userId) => {
  const point = await getOrCreatePoint(userId);
  return {
    balance: point.balance,
    pendingPoints: point.pendingPoints,
    totalEarned: point.totalEarned,
    totalSpent: point.totalSpent,
  };
};

module.exports = {
  getOrCreatePoint,
  calculatePointsFromOrder,
  addPendingPoints,
  confirmPendingPoints,
  cancelPendingPoints,
  refundPoints,
  redeemReward,
  getPointHistory,
  getPointBalance,
};
