const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getMyRewardBalance,
  getMyRewardHistory,
} = require("../controllers/RewardController");

/**
 * @swagger
 * /api/rewards/balance:
 *   get:
 *     summary: Get my reward points balance
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current reward points balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy số dư xu thành công"
 *                 balance:
 *                   type: number
 *                   example: 150
 *       401:
 *         description: Unauthorized
 */
router.get("/balance", authenticateToken, getMyRewardBalance);

/**
 * @swagger
 * /api/rewards/history:
 *   get:
 *     summary: Get my reward points transaction history
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of transactions to return
 *     responses:
 *       200:
 *         description: Reward points transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy lịch sử xu thành công"
 *                 balance:
 *                   type: number
 *                   example: 150
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [earn, redeem]
 *                         example: "earn"
 *                       amount:
 *                         type: number
 *                         example: 50
 *                       reason:
 *                         type: string
 *                         example: "Mua hàng thành công"
 *                       meta:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/history", authenticateToken, getMyRewardHistory);

module.exports = router;
