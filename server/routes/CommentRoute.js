const express = require("express");
const router = express.Router();
const {
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/CommentController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Product comment management APIs
 */

/**
 * @swagger
 * /api/product/{id}/comments:
 *   post:
 *     summary: Create a comment for a product
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Already commented or invalid data
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/comments", authenticateToken, createComment);

/**
 * @swagger
 * /api/product/{id}/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not allowed to update other's comment
 *       404:
 *         description: Product or comment not found
 */
router.put("/:id/comments/:commentId", authenticateToken, updateComment);

/**
 * @swagger
 * /api/product/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not allowed to delete other's comment
 *       404:
 *         description: Product or comment not found
 */
router.delete("/:id/comments/:commentId", authenticateToken, deleteComment);

module.exports = router;
