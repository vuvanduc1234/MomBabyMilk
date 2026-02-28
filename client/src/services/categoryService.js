import axiosInstance from "../lib/axios";

/**
 * Get all categories with brands and parent category populated
 */
export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get("/api/category");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error.response?.data || error;
  }
};

/**
 * Transform flat categories into hierarchical structure
 * Returns categories organized by parent-child relationships
 */
export const getHierarchicalCategories = async () => {
  try {
    const response = await getAllCategories();
    const categories = response.data || [];

    // Separate root categories (no parent) and child categories
    const rootCategories = categories.filter((cat) => !cat.parentCategory);
    const childCategories = categories.filter((cat) => cat.parentCategory);

    // Build hierarchical structure
    const hierarchical = rootCategories.map((parent) => {
      const children = childCategories.filter(
        (child) => child.parentCategory._id === parent._id,
      );

      return {
        _id: parent._id,
        name: parent.name,
        description: parent.description,
        brands: parent.brands || [],
        subcategories: children.map((child) => ({
          _id: child._id,
          name: child.name,
          description: child.description,
          brands: child.brands || [],
        })),
      };
    });

    return hierarchical;
  } catch (error) {
    console.error("Error building hierarchical categories:", error);
    throw error;
  }
};
