import { log } from "console";
import { CategoryService } from "../services/category.service.js";
import { ApiResponse, ApiError } from "../utils/index.js";

export const CategoryController = {
  /**
   *  Create a new category
   */
  async create(req, res, next) {
    try {
      const { name, ai_prompt } = req.body;

      if (!name || !ai_prompt) {
        throw new ApiError(400, "Name and AI Prompt are required");
      }

      const category = await CategoryService.createCategory({ name, ai_prompt });

      return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
    } catch (error) {
      console.error(" Error creating category:", error);
      next(error);
    }
  },

  /**
   *  Get all categories (with pagination + search)
   */
  async getAll(req, res, next) {
    console.log("get all categories")
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
  
      const result = await CategoryService.getAllCategories({
        page: Number(page),
        limit: Number(limit),
        search,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Categories retrieved successfully"));
    } catch (error) {
      console.error(" Error fetching categories:", error);
      next(error);
    }
  },

  /**
   *  Get category by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const category = await CategoryService.getCategoryById(id);
      if (!category) throw new ApiError(404, "Category not found");

      return res
        .status(200)
        .json(new ApiResponse(200, category, "Category retrieved successfully"));
    } catch (error) {
      console.error(" Error fetching category by ID:", error);
      next(error);
    }
  },

  /**
   *  Update category
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, ai_prompt } = req.body;
      console.log("updated name ",name);
      console.log("update prompt",ai_prompt);
      
      

      const updatedCategory = await CategoryService.updateCategory(id, { name, ai_prompt });
      console.log("updated category",updatedCategory);
      
      if (!updatedCategory) throw new ApiError(404, "Category not found");

      return res
        .status(200)
        .json(new ApiResponse(200, updatedCategory, "Category updated successfully"));
    } catch (error) {
      console.error(" Error updating category:", error);
      next(error);
    }
  },

  /**
   *  Delete category
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const deleted = await CategoryService.deleteCategory(id);
      if (!deleted) throw new ApiError(404, "Category not found");

      return res
        .status(200)
        .json(new ApiResponse(200, deleted, "Category deleted successfully"));
    } catch (error) {
      console.error(" Error deleting category:", error);
      next(error);
    }
  },
};
