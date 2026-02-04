const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const VoucherModel = require('../models/VoucherModel');
const {
  createManualVoucher,
  createRandomVoucher,
  assignVoucherToUser,
  assignVoucherToAll,
  getMyVouchers,
  applyVoucher
} = require('../controllers/VoucherController');

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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const vouchers = await VoucherModel.find();
    res.status(200).json({ message: "Danh sách voucher", data: vouchers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
router.post('/validate', authenticateToken, applyVoucher);

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
router.post('/apply', authenticateToken, applyVoucher);

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
router.post('/create-manual', authenticateToken, createManualVoucher);

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
router.post('/create-random', authenticateToken, createRandomVoucher);

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
router.post('/assign-to-user', authenticateToken, assignVoucherToUser);

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
router.post('/assign-to-all', authenticateToken, assignVoucherToAll);

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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || req.params.id.length !== 24) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const updatedVoucher = await VoucherModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVoucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }
    res.status(200).json({ message: 'Cập nhật voucher thành công', data: updatedVoucher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
 *         description: Invalid ID
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || req.params.id.length !== 24) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const deletedVoucher = await VoucherModel.findByIdAndDelete(req.params.id);
    if (!deletedVoucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
router.get('/:idOrCode', authenticateToken, async (req, res) => {
  try {
    const { idOrCode } = req.params;
    let voucher;
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(idOrCode) && idOrCode.length === 24) {
      voucher = await VoucherModel.findById(idOrCode);
    } else {
      // Search by code
      voucher = await VoucherModel.findOne({ code: idOrCode.toUpperCase() });
    }
    
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }
    res.status(200).json({ message: "Chi tiết voucher", data: voucher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
