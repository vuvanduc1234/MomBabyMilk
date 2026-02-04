const express = require("express");
const router = express.Router();
const { upload, uploadAvatar } = require("../controllers/UploadController");
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

module.exports = router;
