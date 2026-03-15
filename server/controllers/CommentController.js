const ProductModel = require("../models/ProductModel");
const OrderModel = require("../models/OrderModel");

const createComment = async (req, res) => {
  try {
    const { rating, content } = req.body;

    // Kiểm tra xem user đã mua và nhận hàng thành công chưa
    const hasBoughtAndReceived = await OrderModel.findOne({
      customer: req.user.id,
      "cartItems.product": req.params.id,
      orderStatus: "delivered",
    });

    if (!hasBoughtAndReceived) {
      return res.status(403).json({
        message:
          "Bạn chỉ có thể đánh giá sản phẩm sau khi mua và nhận hàng thành công.",
      });
    }

    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const alreadyCommented = product.comments.find(
      (comment) =>
        comment.author && comment.author.toString() === req.user.id.toString(),
    );
    if (alreadyCommented) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const newComment = {
      rating,
      content,
      author: req.user.id,
    };

    product.comments.push(newComment);
    await product.save();

    await product.populate("comments.author", "fullname");

    return res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const comment = await product.comments.id(req.params.commentId);
    if (!comment)
      return res.status(404).json({ message: "Không tìm thấy comment" });
    if (comment.author.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không thể cập nhập comment của người khác" });
    }

    comment.rating = req.body.rating || comment.rating;
    comment.content = req.body.content || comment.content;
    await product.save();
    await product.populate("comments.author", "fullname");
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    const comment = await product.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy comment" });
    }
    if (comment.author.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không thể xóa comment của người khác" });
    }
    product.comments.pull(req.params.commentId);
    await product.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { createComment, updateComment, deleteComment };
