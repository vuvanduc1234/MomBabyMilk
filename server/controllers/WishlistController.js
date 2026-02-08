const UserModel = require("../models/UserModel");
const ProductModel = require("../models/ProductModel");

// Lấy wishlist của user
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Thêm sản phẩm vào wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Thêm vào wishlist (nếu chưa có)
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } }, // $addToSet prevents duplicates
      { new: true },
    ).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true },
    ).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Xóa tất cả sản phẩm khỏi wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { wishlist: [] } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa tất cả sản phẩm khỏi danh sách yêu thích",
      wishlist: [],
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Kiểm tra sản phẩm có trong wishlist không
const checkInWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isInWishlist = user.wishlist.includes(productId);

    res.status(200).json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist,
};
