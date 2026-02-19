const express = require("express");
const router = express.Router();
const { upload, uploadBlogImageMulter, uploadAvatar, uploadProductImage, uploadBrandLogo, uploadBlogImage } = require("../controllers/UploadController");
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

/**
 * @swagger
 * /api/upload/blog-image:
 *   post:
 *     summary: Upload blog article image
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       200:
 *         description: Blog image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: No file selected
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/blog-image", authenticateToken, uploadBlogImageMulter.single("file"), uploadBlogImage);

module.exports = router;
