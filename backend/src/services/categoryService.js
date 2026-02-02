const CategoryModel = require('../models/categoryModel');
const { slugify } = require('../utils/stringUtils');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper to upload base64 images to Cloudinary
 * @param {string} dataUrl 
 */
async function saveDataUrlImage(dataUrl) {
    if (!dataUrl) return null;
    
    // If it's already a URL (e.g. from existing record), return it
    if (dataUrl.startsWith('http')) return dataUrl;

    // dataUrl format: data:<mime-type>;base64,<data>
    const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;

    try {
        const result = await cloudinary.uploader.upload(dataUrl, {
            folder: 'swadeshika/categories',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `category-${Date.now()}-${uuidv4()}`
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null; 
    }
}

/**
 * categoryService.js
 * ------------------
 * Business logic for Category operations.
 * Handles slug generation, uniqueness checks, and data preparation.
 */
class CategoryService {
    /**
     * Get all categories
     * 
     * @param {Object} query - Query parameters (e.g., includeSubcategories)
     * @returns {Promise<Array>} List of categories
     */
    static async getAllCategories(query) {
        const includeSubcategories = query.includeSubcategories === 'true';
        return await CategoryModel.findAll({ includeSubcategories });
    }

    /**
     * Get category by ID
     * 
     * @param {number|string} id - Category ID
     * @returns {Promise<Object>} Category object
     * @throws {Error} If category not found
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
     * 
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Created category object with ID
     * @throws {Error} If slug/name already exists
     */
    static async createCategory(data) {
        // Generate slug if not provided
        const slug = data.slug || slugify(data.name);

        // Check if slug exists
        const existing = await CategoryModel.findBySlug(slug);
        if (existing) {
            throw new Error('Category with this name/slug already exists');
        }

        let imageUrl = null;
        if (data.image_url) {
            imageUrl = await saveDataUrlImage(data.image_url);
        }

        const categoryData = {
            ...data,
            slug,
            image_url: imageUrl
        };

        const id = await CategoryModel.create(categoryData);
        return { id, ...categoryData };
    }

    /**
     * Update category
     * 
     * @param {number|string} id - Category ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated category object
     * @throws {Error} If category not found or slug collision
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

        let imageUrl = category.image_url;
        if (data.image_url !== undefined) {
             // If null/empty string passed, it might mean remove? 
             // Logic: If new data has image_url, try to upload. 
             // If it's same as old, saveDataUrlImage returns it.
             // If it is different base64, it uploads new.
             if (data.image_url) {
                imageUrl = await saveDataUrlImage(data.image_url);
             } else {
                 // explicit empty string/null could mean delete
                 imageUrl = null;
             }
        }

        const updateData = {
            ...category,
            ...data,
            slug: slug || category.slug,
            image_url: imageUrl
        };

        await CategoryModel.update(id, updateData);
        return updateData;
    }

    /**
     * Delete category
     * 
     * @param {number|string} id - Category ID
     * @returns {Promise<boolean>} True if deleted
     * @throws {Error} If category not found
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
