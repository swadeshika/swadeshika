const BlogCategoryModel = require('../models/blogCategoryModel');

/**
 * BlogCategoryService
 * Business logic for blog categories
 */
class BlogCategoryService {
    /**
     * Get all blog categories
     * @returns {Promise<Array>}
     */
    static async getAllCategories() {
        return await BlogCategoryModel.findAll();
    }

    /**
     * Get active categories only
     * @returns {Promise<Array>}
     */
    static async getActiveCategories() {
        return await BlogCategoryModel.findActive();
    }

    /**
     * Get a single category
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async getCategory(id) {
        const category = await BlogCategoryModel.findById(id);
        if (!category) {
            const error = new Error('Blog category not found');
            error.statusCode = 404;
            throw error;
        }
        return category;
    }

    /**
     * Create a new category
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async createCategory(data) {
        const { name, slug, description, display_order, is_active } = data;

        // Generate slug if not provided
        const finalSlug = slug || this.generateSlug(name);

        // Check if slug already exists
        const exists = await BlogCategoryModel.existsBySlug(finalSlug);
        if (exists) {
            const error = new Error('A category with this slug already exists');
            error.statusCode = 409;
            throw error;
        }

        return await BlogCategoryModel.create({
            name,
            slug: finalSlug,
            description,
            display_order,
            is_active
        });
    }

    /**
     * Update a category
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async updateCategory(id, data) {
        // Check if category exists
        const category = await this.getCategory(id);

        // If slug is being updated, check for conflicts
        if (data.slug && data.slug !== category.slug) {
            const exists = await BlogCategoryModel.existsBySlug(data.slug, id);
            if (exists) {
                const error = new Error('A category with this slug already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        return await BlogCategoryModel.update(id, data);
    }

    /**
     * Delete a category
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    static async deleteCategory(id) {
        // Check if category exists
        await this.getCategory(id);

        const deleted = await BlogCategoryModel.delete(id);
        if (!deleted) {
            const error = new Error('Failed to delete category');
            error.statusCode = 500;
            throw error;
        }
        return true;
    }

    /**
     * Generate URL-friendly slug from name
     * @param {string} name
     * @returns {string}
     */
    static generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}

module.exports = BlogCategoryService;
