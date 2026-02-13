const {
  getRewardBalance,
  getRewardHistory,
} = require("../services/rewardService");

const getMyRewardBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const balance = await getRewardBalance(userId);
    
    res.status(200).json({
      message: "Lấy số dư xu thành công",
      balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy số dư xu",
      error: error.message,
    });
  }
};

const getMyRewardHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { limit = 20 } = req.query;
    const history = await getRewardHistory(userId, parseInt(limit));
    
    res.status(200).json({
      message: "Lấy lịch sử xu thành công",
      ...history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy lịch sử xu",
      error: error.message,
    });
  }
};

module.exports = {
  getMyRewardBalance,
  getMyRewardHistory,
};
