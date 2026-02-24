const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  createManualVoucher,
  createRandomVoucher,
  assignVoucherToUser,
  assignVoucherToAll,
  applyVoucher,
  deleteVoucher,
  getAllVouchers,
  updateVoucher,
  getVoucherByIdOrCode,
} = require("../controllers/VoucherController");

/**
 * @swagger
 * /api/voucher:
 *   get:
 *     summary: Get all vouchers in system
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all vouchers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, getAllVouchers);

/**
 * @swagger
 * /api/voucher/validate:
 *   post:
 *     summary: Validate a voucher code (alias for /apply)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: Voucher code
 *               orderTotal:
 *                 type: number
 *                 description: Total order amount
 *     responses:
 *       200:
 *         description: Voucher validated successfully
 *       400:
 *         description: Invalid voucher or conditions not met
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.post("/validate", authenticateToken, applyVoucher);

/**
 * @swagger
 * /api/voucher/apply:
 *   post:
 *     summary: Apply/Validate a voucher code for order
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: Voucher code
 *               orderTotal:
 *                 type: number
 *                 description: Total order amount
 *     responses:
 *       200:
 *         description: Voucher applied successfully
 *       400:
 *         description: Invalid voucher or conditions not met
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.post("/apply", authenticateToken, applyVoucher);

/**
 * @swagger
 * /api/voucher/create-manual:
 *   post:
 *     summary: Create voucher with custom code (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountPercentage
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *               discountPercentage:
 *                 type: number
 *               description:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               minOrderValue:
 *                 type: number
 *     responses:
 *       201:
 *         description: Voucher created successfully
 *       400:
 *         description: Invalid input or code exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/create-manual", authenticateToken, createManualVoucher);

/**
 * @swagger
 * /api/voucher/create-random:
 *   post:
 *     summary: Create voucher with random code (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discountPercentage
 *               - expiryDate
 *             properties:
 *               discountPercentage:
 *                 type: number
 *               description:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               minOrderValue:
 *                 type: number
 *     responses:
 *       201:
 *         description: Random voucher created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/create-random", authenticateToken, createRandomVoucher);

/**
 * @swagger
 * /api/voucher/assign-to-user:
 *   post:
 *     summary: Assign voucher to specific user (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *               - userId
 *             properties:
 *               voucherId:
 *                 type: string
 *               userId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       200:
 *         description: Voucher assigned successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Voucher or user not found
 *       500:
 *         description: Server error
 */
router.post("/assign-to-user", authenticateToken, assignVoucherToUser);

/**
 * @swagger
 * /api/voucher/assign-to-all:
 *   post:
 *     summary: Assign voucher to all users (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *             properties:
 *               voucherId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       200:
 *         description: Voucher assigned to all users successfully
 *       400:
 *         description: Invalid input or expired voucher
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.post("/assign-to-all", authenticateToken, assignVoucherToAll);

/**
 * @swagger
 * /api/voucher/{id}:
 *   put:
 *     summary: Update voucher (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discountPercentage:
 *                 type: number
 *               description:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               minOrderValue:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Voucher updated successfully
 *       400:
 *         description: Invalid input or invalid ID
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, updateVoucher);

/**
 * @swagger
 * /api/voucher/{id}:
 *   delete:
 *     summary: Delete voucher (Admin only)
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID
 *     responses:
 *       200:
 *         description: Voucher deleted successfully
 *       400:
 *         description: Invalid ID or voucher still in use
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, deleteVoucher);

/**
 * @swagger
 * /api/voucher/{idOrCode}:
 *   get:
 *     summary: Get voucher by ID or Code
 *     tags: [Voucher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID (24 chars) or Code (string)
 *     responses:
 *       200:
 *         description: Voucher details
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.get("/:idOrCode", authenticateToken, getVoucherByIdOrCode);

module.exports = router;
