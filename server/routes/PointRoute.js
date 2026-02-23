const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getMyPointBalance,
  getMyPointHistory,
  getAvailableRewards,
  redeemRewardItem,
  createRewardItem,
  updateRewardItem,
  deleteRewardItem,
  getAllRewardItems,
} = require('../controllers/PointController');

// ==================== USER ROUTES ====================

/**
 * @swagger
 * /api/points/balance:
 *   get:
 *     summary: Get my point balance
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get point balance successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       description: Available points
 *                     pendingPoints:
 *                       type: number
 *                       description: Points pending confirmation (order not delivered yet)
 *                     totalEarned:
 *                       type: number
 *                       description: Total points earned
 *                     totalSpent:
 *                       type: number
 *                       description: Total points spent
 */
router.get('/balance', authenticateToken, getMyPointBalance);

/**
 * @swagger
 * /api/points/history:
 *   get:
 *     summary: Get my point history
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Get point history successfully
 */
router.get('/history', authenticateToken, getMyPointHistory);

/**
 * @swagger
 * /api/points/rewards:
 *   get:
 *     summary: Get available rewards for redemption
 *     tags: [Points]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [voucher]
 *       - in: query
 *         name: minPoints
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPoints
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Get available rewards successfully
 */
router.get('/rewards', getAvailableRewards);

/**
 * @swagger
 * /api/points/redeem/{rewardId}:
 *   post:
 *     summary: Redeem points for reward
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Points redeemed successfully
 *       400:
 *         description: Insufficient points or reward not available
 */
router.post('/redeem/:rewardId', authenticateToken, redeemRewardItem);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/points/admin/rewards:
 *   get:
 *     summary: "[ADMIN] Get all reward items"
 *     tags: [Points - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [voucher]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Get reward items successfully
 */
router.get('/admin/rewards', authenticateToken, requireAdmin, getAllRewardItems);

/**
 * @swagger
 * /api/points/admin/rewards:
 *   post:
 *     summary: "[ADMIN] Create new reward item"
 *     tags: [Points - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - pointsCost
 *               - voucherId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "100K discount voucher"
 *               description:
 *                 type: string
 *               pointsCost:
 *                 type: number
 *                 example: 500
 *               voucherId:
 *                 type: string
 *                 description: Voucher ID (required)
 *               quantity:
 *                 type: number
 *                 description: Null = unlimited
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reward item created successfully
 */
router.post('/admin/rewards', authenticateToken, requireAdmin, createRewardItem);

/**
 * @swagger
 * /api/points/admin/rewards/{id}:
 *   put:
 *     summary: "[ADMIN] Update reward item"
 *     tags: [Points - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               pointsCost:
 *                 type: number
 *               quantity:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward item updated successfully
 */
router.put('/admin/rewards/:id', authenticateToken, requireAdmin, updateRewardItem);

/**
 * @swagger
 * /api/points/admin/rewards/{id}:
 *   delete:
 *     summary: "[ADMIN] Delete reward item"
 *     tags: [Points - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward item deleted successfully
 */
router.delete('/admin/rewards/:id', authenticateToken, requireAdmin, deleteRewardItem);

module.exports = router;
