const Blog = require("../models/BlogModel");
const sanitizeHtml = require("sanitize-html");

// Sanitization options
const sanitizeOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "strong", "em", "u", "s",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "img",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "class"],
  },
  allowedClasses: {
    img: ["max-w-full", "h-auto", "rounded-lg"],
  },
};

const createBlog = async (req, res) => {
  try {
    const { title, content, author, tags, recommended_products, image } =
      req.body;

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = sanitizeHtml(content, sanitizeOptions);

    const blog = new Blog({
      title,
      content: sanitizedContent,
      author,
      tags,
      recommended_products,
      image,
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate("recommended_products", "name price imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate(
      "recommended_products",
      "name price imageUrl description brand",
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Sanitize HTML content if it exists in the update
    if (updateData.content) {
      updateData.content = sanitizeHtml(updateData.content, sanitizeOptions);
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("recommended_products", "name price imageUrl");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

const getBlogsByTags = async (req, res) => {
  try {
    const { tags } = req.params;
    const tagsArray = tags.split(",");

    const blogs = await Blog.find({
      tags: { $in: tagsArray },
    })
      .populate("recommended_products", "name price imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs by tags",
      error: error.message,
    });
  }
};

const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("recommended_products", "name price imageUrl");

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular blogs",
      error: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogsByTags,
  getPopularBlogs,
};
