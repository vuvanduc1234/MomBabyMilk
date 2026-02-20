const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserModel");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file PNG hoặc JPEG"), false);
    }
  },
});

// Multer config for blog images (5MB limit, more formats)
const uploadBlogImageMulter = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPG, PNG, GIF hoặc WebP"), false);
    }
  },
});


const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh",
      });
    }

    const userId = req.user.id; 

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          public_id: `avatar_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      message: "Upload avatar thành công",
      data: {
        avatar: result.secure_url,
      },
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({
      message: "Lỗi khi upload avatar: " + err.message,
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          public_id: `product_${Date.now()}`,
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    return res.status(200).json({
      message: "Upload ảnh sản phẩm thành công",
      data: {
        imageUrl: result.secure_url,
      },
    });
  } catch (err) {
    console.error("Upload product image error:", err);
    res.status(500).json({
      message: "Lỗi khi upload ảnh sản phẩm: " + err.message,
    });
  }
};

const uploadBrandLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "brands",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          public_id: `brand_${Date.now()}`,
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    return res.status(200).json({
      message: "Upload logo thương hiệu thành công",
      data: {
        logoUrl: result.secure_url,
      },
    });
  } catch (err) {
    console.error("Upload brand logo error:", err);
    res.status(500).json({
      message: "Lỗi khi upload logo thương hiệu: " + err.message,
    });
  }
};

const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog-images",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          public_id: `blog_${Date.now()}`,
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Upload ảnh bài viết thành công",
      url: result.secure_url,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (err) {
    console.error("Upload blog image error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi upload ảnh: " + err.message,
    });
  }
};

module.exports = {
  upload,
  uploadBlogImageMulter,
  uploadAvatar,
  uploadProductImage,
  uploadBrandLogo,
  uploadBlogImage,
};
