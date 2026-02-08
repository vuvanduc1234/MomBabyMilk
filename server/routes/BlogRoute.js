const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogsByTags,
  getPopularBlogs,
} = require("../controllers/BlogController");

// Có thể thêm middleware auth nếu cần
// const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management APIs
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommended_products:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", createBlog); // Có thể thêm: verifyToken, isAdmin

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all blogs
 *       500:
 *         description: Server error
 */
router.get("/", getAllBlogs);

/**
 * @swagger
 * /api/blogs/popular:
 *   get:
 *     summary: Get latest blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of latest blogs to return
 *     responses:
 *       200:
 *         description: List of latest blogs
 */
router.get("/popular", getPopularBlogs);

/**
 * @swagger
 * /api/blogs/tags/{tags}:
 *   get:
 *     summary: Get blogs by tags
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: tags
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *     responses:
 *       200:
 *         description: List of blogs with specified tags
 */
router.get("/tags/:tags", getBlogsByTags);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog details
 *       404:
 *         description: Blog not found
 */
router.get("/:id", getBlogById);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommended_products:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 */
router.put("/:id", updateBlog); // Có thể thêm: verifyToken, isAdmin

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
router.delete("/:id", deleteBlog); // Có thể thêm: verifyToken, isAdmin

module.exports = router;
