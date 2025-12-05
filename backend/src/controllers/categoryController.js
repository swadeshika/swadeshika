const CategoryService = require('../services/categoryService');

/**
 * categoryController.js
 * ---------------------
 * Handles all category-related operations.
 * 
 * Public:
 * - Get All Categories
 * - Get Category By ID
 * 
 * Admin Only:
 * - Create Category
 * - Update Category
 * - Delete Category
 */
class CategoryController {
    /**
     * Get all categories
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getAllCategories(req, res, next) {
        try {
            const categories = await CategoryService.getAllCategories(req.query);
            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get category by ID
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getCategory(req, res, next) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            if (error.message === 'Category not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Create category
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async createCategory(req, res, next) {
        try {
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Update category
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async updateCategory(req, res, next) {
        try {
            const category = await CategoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error) {
            if (error.message === 'Category not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('already exists')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Delete category
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async deleteCategory(req, res, next) {
        try {
            await CategoryService.deleteCategory(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            if (error.message === 'Category not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

module.exports = CategoryController;
