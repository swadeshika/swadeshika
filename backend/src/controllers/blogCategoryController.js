const BlogCategoryService = require('../services/blogCategoryService');

/**
 * BlogCategoryController
 * Handles HTTP requests for blog categories
 */
class BlogCategoryController {
    /**
     * Get all categories
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async getAllCategories(req, res, next) {
        try {
            const categories = await BlogCategoryService.getAllCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active categories only
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async getActiveCategories(req, res, next) {
        try {
            const categories = await BlogCategoryService.getActiveCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single category
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async getCategory(req, res, next) {
        try {
            const category = await BlogCategoryService.getCategory(req.params.id);
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new category
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async createCategory(req, res, next) {
        try {
            const category = await BlogCategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: 'Blog category created successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a category
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async updateCategory(req, res, next) {
        try {
            const category = await BlogCategoryService.updateCategory(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Blog category updated successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a category
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    static async deleteCategory(req, res, next) {
        try {
            await BlogCategoryService.deleteCategory(req.params.id);
            res.json({
                success: true,
                message: 'Blog category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BlogCategoryController;
