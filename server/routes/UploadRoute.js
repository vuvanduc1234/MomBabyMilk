const express = require("express");
const router = express.Router();
const { upload, uploadAvatar, uploadProductImage, uploadBrandLogo } = require("../controllers/UploadController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file selected
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/avatar", authenticateToken, upload.single("avatar"), uploadAvatar);

/**
 * @swagger
 * /api/upload/product-image:
 *   post:
 *     summary: Upload product image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product image uploaded successfully
 *       400:
 *         description: No file selected
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/product-image", authenticateToken, upload.single("productImage"), uploadProductImage);

/**
 * @swagger
 * /api/upload/brand-logo:
 *   post:
 *     summary: Upload brand logo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               brandLogo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Brand logo uploaded successfully
 *       400:
 *         description: No file selected
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/brand-logo", authenticateToken, upload.single("brandLogo"), uploadBrandLogo);

module.exports = router;
