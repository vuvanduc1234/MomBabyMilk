const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const BrandModel = require("../models/BrandModel");

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
    const categoryExists = await CategoryModel.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Danh mục không tồn tại" });
    }

    const brandExists = await BrandModel.findById(brand);
    if (!brandExists) {
      return res.status(400).json({ message: "Thương hiệu không tồn tại" });
    }

    const existProduct = await ProductModel.findOne({ name });
    if (existProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại" });
    }
    const product = new ProductModel(req.body);
    await product.save();
    await product.populate("category brand");
    res.status(200).json({ message: "Tạo sản phẩm thành công", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server:" + err.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.category) {
      const categoryExists = await CategoryModel.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Danh mục không tồn tại" });
      }
    }

    if (req.body.brand) {
      const brandExists = await BrandModel.findById(req.body.brand);
      if (!brandExists) {
        return res.status(400).json({ message: "Thương hiệu không tồn tại" });
      }
    }
    const product = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category brand");
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res
      .status(200)
      .json({ message: "Cập nhập sản phẩm thành công", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server:" + err.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err.message });
  }
};

const viewProduct = async (req, res) => {
  try {
    const product = await ProductModel.find({}).populate("category brand");
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xem toàn bộ sản phẩm", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err.message });
  }
};

const getProductsById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id).populate("category brand");
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ message: "Xem sản phẩm", data: product });
  } catch (err) {
    res.status(500).json({ message: "Lối server:" + err.message });
  }
};

const getProductsByCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await ProductModel.find({ category: id }).populate(
      "category brand",
    );

    res.status(200).json({
      message: "Lấy sản phẩm theo danh mục thành công",
      data: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getProductsByBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await ProductModel.find({ brand: id }).populate(
      "category brand",
    );

    res.status(200).json({
      message: "Lấy sản phẩm theo thương hiệu thành công",
      data: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};
module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  viewProduct,
  getProductsById,
  getProductsByCategory,
  getProductsByBrand,
};
