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

module.exports = {
  upload,
  uploadAvatar,
};
