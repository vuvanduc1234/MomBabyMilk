const CategoryModel = require("../models/CategoryModel");
const BrandModel = require("../models/BrandModel");

const createCategory = async (req, res) => {
  const { name, description, brands } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Vui lòng cung cấp tên danh mục",
    });
  }

  try {
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: "Danh mục đã tồn tại",
      });
    }

    const category = new CategoryModel(req.body);
    await category.save();

    if (brands && brands.length > 0) {
      await BrandModel.updateMany(
        { _id: { $in: brands } },
        { $addToSet: { categories: category._id } }
      );
    }

    const populatedCategory = await CategoryModel.findById(category._id)
      .populate('brands')
      .populate('parentCategory');
    res.status(201).json({
      message: "Tạo danh mục thành công",
      data: populatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({})
      .populate('brands')
      .populate('parentCategory');
    res.status(200).json({
      message: "Lấy danh sách danh mục thành công",
      data: categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await CategoryModel.findById(id)
      .populate('brands')
      .populate('parentCategory');

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      message: "Tìm danh mục thành công",
      data: category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { brands } = req.body;

  try {
    const oldCategory = await CategoryModel.findById(id);
    if (!oldCategory) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    if (req.body.hasOwnProperty('brands')) {
      if (oldCategory.brands && oldCategory.brands.length > 0) {
        await BrandModel.updateMany(
          { _id: { $in: oldCategory.brands } },
          { $pull: { categories: id } }
        );
      }

      if (brands && brands.length > 0) {
        await BrandModel.updateMany(
          { _id: { $in: brands } },
          { $addToSet: { categories: id } }
        );
      }
    }

    const category = await CategoryModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('brands').populate('parentCategory');

    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await CategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    if (category.brands && category.brands.length > 0) {
      await BrandModel.updateMany(
        { _id: { $in: category.brands } },
        { $pull: { categories: id } }
      );
    }

    await CategoryModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa danh mục thành công",
      data: category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const addBrandsToCategory = async (req, res) => {
  const { id } = req.params;
  const { brandIds } = req.body;

  if (!brandIds || !Array.isArray(brandIds)) {
    return res.status(400).json({
      message: "Vui lòng cung cấp danh sách ID thương hiệu",
    });
  }

  try {
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    await CategoryModel.findByIdAndUpdate(
      id,
      { $addToSet: { brands: { $each: brandIds } } }
    );

    await BrandModel.updateMany(
      { _id: { $in: brandIds } },
      { $addToSet: { categories: id } }
    );

    const updatedCategory = await CategoryModel.findById(id)
      .populate('brands')
      .populate('parentCategory');

    res.status(200).json({
      message: "Thêm thương hiệu vào danh mục thành công",
      data: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

const removeBrandsFromCategory = async (req, res) => {
  const { id } = req.params;
  const { brandIds } = req.body;

  if (!brandIds || !Array.isArray(brandIds)) {
    return res.status(400).json({
      message: "Vui lòng cung cấp danh sách ID thương hiệu",
    });
  }

  try {
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    await CategoryModel.findByIdAndUpdate(
      id,
      { $pull: { brands: { $in: brandIds } } }
    );

    await BrandModel.updateMany(
      { _id: { $in: brandIds } },
      { $pull: { categories: id } }
    );

    const updatedCategory = await CategoryModel.findById(id)
      .populate('brands')
      .populate('parentCategory');

    res.status(200).json({
      message: "Xóa thương hiệu khỏi danh mục thành công",
      data: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addBrandsToCategory,
  removeBrandsFromCategory,
};
