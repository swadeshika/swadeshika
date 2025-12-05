const CategoryService = require('../services/categoryService');

class CategoryController {
    /**
     * Get all categories
     */
    static async getAllCategories(req, res) {
        try {
            const categories = await CategoryService.getAllCategories(req.query);
            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get category by ID
     */
    static async getCategory(req, res) {
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
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Create category
     */
    static async createCategory(req, res) {
        try {
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update category
     */
    static async updateCategory(req, res) {
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
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete category
     */
    static async deleteCategory(req, res) {
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
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = CategoryController;
