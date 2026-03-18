const BrandModel = require("../models/BrandModel");
const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");
const createBrand = async (req, res) => {
  const { name, description, logoUrl, categories } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Vui lòng cung cấp tên thương hiệu",
    });
  }

  try {
    const existingBrand = await BrandModel.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({
        message: "Thương hiệu đã tồn tại",
      });
    }

    const brand = new BrandModel(req.body);
    await brand.save();

    if (categories && categories.length > 0) {
      await CategoryModel.updateMany(
        { _id: { $in: categories } },
        { $addToSet: { brands: brand._id } },
      );
    }

    const populatedBrand = await BrandModel.findById(brand._id).populate(
      "categories",
    );
    res.status(201).json({
      message: "Tạo thương hiệu thành công",
      data: populatedBrand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await BrandModel.find({}).populate("categories");
    res.status(200).json({
      message: "Lấy danh sách thương hiệu thành công",
      data: brands,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await BrandModel.findById(id).populate("categories");

    if (!brand) {
      return res.status(404).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

    res.status(200).json({
      message: "Tìm thương hiệu thành công",
      data: brand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, categories } = req.body;

  try {
    const oldBrand = await BrandModel.findById(id);
    if (!oldBrand) {
      return res.status(404).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

    if (typeof name === "string" && name.trim()) {
      const duplicateBrand = await BrandModel.findOne({
        _id: { $ne: id },
        name: name.trim(),
      });

      if (duplicateBrand) {
        return res.status(400).json({
          message: "Tên thương hiệu đã tồn tại",
        });
      }
    }

    if (req.body.hasOwnProperty("categories")) {
      if (oldBrand.categories && oldBrand.categories.length > 0) {
        await CategoryModel.updateMany(
          { _id: { $in: oldBrand.categories } },
          { $pull: { brands: id } },
        );
      }

      if (categories && categories.length > 0) {
        await CategoryModel.updateMany(
          { _id: { $in: categories } },
          { $addToSet: { brands: id } },
        );
      }
    }

    const brand = await BrandModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("categories");

    res.status(200).json({
      message: "Cập nhật thương hiệu thành công",
      data: brand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await BrandModel.findById(id);

    if (!brand) {
      return res.status(404).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

    // BUG FIX 2: Không set brand=null vì ProductModel.brand là required:true
    // Kiểm tra còn sản phẩm nào đang dùng brand này không
    const productsUsingBrand = await ProductModel.countDocuments({ brand: id });
    if (productsUsingBrand > 0) {
      return res.status(400).json({
        message: `Không thể xóa: có ${productsUsingBrand} sản phẩm đang sử dụng thương hiệu này. Vui lòng gán lại thương hiệu cho các sản phẩm trước.`,
        productsCount: productsUsingBrand,
      });
    }

    if (brand.categories && brand.categories.length > 0) {
      await CategoryModel.updateMany(
        { _id: { $in: brand.categories } },
        { $pull: { brands: id } },
      );
    }

    await BrandModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa thương hiệu thành công",
      data: brand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const addCategoriesToBrand = async (req, res) => {
  const { id } = req.params;
  const { categoryIds } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds)) {
    return res.status(400).json({
      message: "Vui lòng cung cấp danh sách ID danh mục",
    });
  }

  try {
    const brand = await BrandModel.findById(id);
    if (!brand) {
      return res.status(404).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

    await BrandModel.findByIdAndUpdate(id, {
      $addToSet: { categories: { $each: categoryIds } },
    });

    await CategoryModel.updateMany(
      { _id: { $in: categoryIds } },
      { $addToSet: { brands: id } },
    );

    const updatedBrand = await BrandModel.findById(id).populate("categories");

    res.status(200).json({
      message: "Thêm danh mục vào thương hiệu thành công",
      data: updatedBrand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const removeCategoriesFromBrand = async (req, res) => {
  const { id } = req.params;
  const { categoryIds } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds)) {
    return res.status(400).json({
      message: "Vui lòng cung cấp danh sách ID danh mục",
    });
  }

  try {
    const brand = await BrandModel.findById(id);
    if (!brand) {
      return res.status(404).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

    await BrandModel.findByIdAndUpdate(id, {
      $pull: { categories: { $in: categoryIds } },
    });

    await CategoryModel.updateMany(
      { _id: { $in: categoryIds } },
      { $pull: { brands: id } },
    );

    const updatedBrand = await BrandModel.findById(id).populate("categories");

    res.status(200).json({
      message: "Xóa danh mục khỏi thương hiệu thành công",
      data: updatedBrand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  addCategoriesToBrand,
  removeCategoriesFromBrand,
};
