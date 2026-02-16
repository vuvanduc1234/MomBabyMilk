const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/auth");
const {
  getRevenueOverview,
  getRevenueChart,
  getTopProducts,
  getOrdersStats,
  getCustomersStats,
  getRevenueByCategory,
  getRevenueSummary,
} = require("../controllers/AnalyticsController");

/**
 * @swagger
 * /api/analytics/revenue-summary:
 *   get:
 *     summary: Get revenue summary (today, week, month, year, all-time)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue summary retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/revenue-summary",
  authenticateToken,
  checkRole(["Admin"]),
  getRevenueSummary
);

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get revenue overview with growth rate
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Default 30 days ago
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Default today
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Period for comparison
 *     responses:
 *       200:
 *         description: Revenue overview retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/revenue", authenticateToken, checkRole(["Admin"]), getRevenueOverview);

/**
 * @swagger
 * /api/analytics/revenue/chart:
 *   get:
 *     summary: Get revenue chart data for visualization
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date. Default 30 days ago
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date. Default today
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month, year]
 *         description: Group data by period (default day)
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/revenue/chart",
  authenticateToken,
  checkRole(["Admin"]),
  getRevenueChart
);

/**
 * @swagger
 * /api/analytics/top-products:
 *   get:
 *     summary: Get top selling products
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/top-products",
  authenticateToken,
  checkRole(["Admin"]),
  getTopProducts
);

/**
 * @swagger
 * /api/analytics/orders-stats:
 *   get:
 *     summary: Get orders statistics breakdown
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Orders stats retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/orders-stats",
  authenticateToken,
  checkRole(["Admin"]),
  getOrdersStats
);

/**
 * @swagger
 * /api/analytics/customers-stats:
 *   get:
 *     summary: Get customers statistics including top customers
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Customer stats retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/customers-stats",
  authenticateToken,
  checkRole(["Admin"]),
  getCustomersStats
);

/**
 * @swagger
 * /api/analytics/revenue-by-category:
 *   get:
 *     summary: Get revenue breakdown by product categories
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Revenue by category retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/revenue-by-category",
  authenticateToken,
  checkRole(["Admin"]),
  getRevenueByCategory
);

module.exports = router;
