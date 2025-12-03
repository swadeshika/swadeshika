const CategoryModel = require('../models/categoryModel');
const { slugify } = require('../utils/stringUtils');

class CategoryService {
    /**
     * Get all categories
     */
    static async getAllCategories(query) {
        const includeSubcategories = query.includeSubcategories === 'true';
        return await CategoryModel.findAll({ includeSubcategories });
    }

    /**
     * Get category by ID
     */
    static async getCategoryById(id) {
        const category = await CategoryModel.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    /**
     * Create new category
     */
    static async createCategory(data) {
        // Generate slug if not provided
        const slug = data.slug || slugify(data.name);

        // Check if slug exists
        const existing = await CategoryModel.findBySlug(slug);
        if (existing) {
            throw new Error('Category with this name/slug already exists');
        }

        const categoryData = {
            ...data,
            slug
        };

        const id = await CategoryModel.create(categoryData);
        return { id, ...categoryData };
    }

    /**
     * Update category
     */
    static async updateCategory(id, data) {
        const category = await CategoryModel.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Update slug if name changes and slug not provided, or if slug explicitly changed
        let slug = data.slug;
        if (!slug && data.name && data.name !== category.name) {
            slug = slugify(data.name);
        }

        // If slug is changing, check uniqueness
        if (slug && slug !== category.slug) {
            const existing = await CategoryModel.findBySlug(slug);
            if (existing && existing.id != id) {
                throw new Error('Category with this name/slug already exists');
            }
        }

        const updateData = {
            ...category,
            ...data,
            slug: slug || category.slug
        };

        await CategoryModel.update(id, updateData);
        return updateData;
    }

    /**
     * Delete category
     */
    static async deleteCategory(id) {
        const category = await CategoryModel.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        await CategoryModel.delete(id);
        return true;
    }
}

module.exports = CategoryService;
