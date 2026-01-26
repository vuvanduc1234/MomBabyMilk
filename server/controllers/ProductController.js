const ProductModel = require("../models/ProductModel");

const createProduct = async (req, res) => {
  const {
    name,
    price,
    category,
    brand,
    quantity,
    imageUrl,
    manufacture,
    expiry,
    storageInstructions,
    instructionsForUse,
    warning,
    manufacturer,
    appropriateAge,
    weight,
  } = req.body;
  if (!name || !price || !category || !brand || !quantity || !imageUrl) {
    return res.status(400).json({
      message:
        "Vui lòng cập nhập các trường name, price, category, brand, quantity, imageUrl",
    });
  }

  try {
    const product = new ProductModel(req.body);
    await product.save();
    res.status(200).json({ message: "Tạo sản phẩm thành công", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server:" + err });
  }
};

const updateProduct = async (req, res) => {
  const { id } = await req.params;
  try {
    const product = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res
      .status(200)
      .json({ message: "Cập nhập sản phẩm thành công", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server:" + err });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = await req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err });
  }
};

const viewProduct = async (req, res) => {
  try {
    const product = await ProductModel.find({});
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xem toàn bộ sản phẩm", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err });
  }
};

const findByProductId = async (req, res) => {
  const { id } = await req.params;
  try {
    const product = await ProductModel.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xem sản phẩm", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err });
  }
};
module.exports = { createProduct, updateProduct, deleteProduct, viewProduct, findByProductId };
