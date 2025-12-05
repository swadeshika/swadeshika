const BlogModel = require('../models/blogModel');
const { slugify } = require('../utils/stringUtils');
const { getMessage } = require('../constants/messages');

/**
 * blogController.js
 * -----------------
 * Handles all blog-related operations:
 * 1. Get All Posts (Public)
 * 2. Get Post By Slug (Public)
 * 3. Create Post (Admin)
 * 4. Update Post (Admin)
 * 5. Delete Post (Admin)
 */

/**
 * Get all blog posts
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllPosts = async (req, res, next) => {
    try {
        const { page, limit, category, search, status } = req.query;
        const result = await BlogModel.findAll({ page, limit, category, search, status });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get blog post by slug
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPostBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const post = await BlogModel.findBySlug(slug);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: getMessage('NOT_FOUND')
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create blog post (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPost = async (req, res, next) => {
    try {
        const { title, content, excerpt, featuredImage, category, tags, status } = req.body;
        const authorId = req.user.id; // From auth middleware

        // Generate slug from title if not provided
        const slug = req.body.slug || slugify(title);

        // Default category to 'swadeshika' if not provided
        const categoryInput = category || 'swadeshika';

        // Handle category: if string, try to find ID, otherwise assume ID
        let categoryId = categoryInput;
        if (typeof categoryInput === 'string' && isNaN(categoryInput)) {
            categoryId = await BlogModel.getCategoryIdByName(categoryInput);

            // If category not found, create it
            if (!categoryId) {
                categoryId = await BlogModel.createCategory(categoryInput);
            }
        }

        const newPostId = await BlogModel.create({
            title,
            slug,
            excerpt,
            content,
            featured_image: featuredImage,
            author_id: authorId,
            category_id: categoryId,
            tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: {
                id: newPostId,
                slug
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Slug already exists'
            });
        }
        next(err);
    }
};

/**
 * Update blog post (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, featuredImage, category, tags, status, slug } = req.body;

        // Handle category lookup if string
        let categoryId = category;
        if (typeof category === 'string' && isNaN(category)) {
            categoryId = await BlogModel.getCategoryIdByName(category);
        }

        const updated = await BlogModel.update(id, {
            title,
            slug: slug || (title ? slugify(title) : undefined), // Only update slug if provided or title changed? Maybe risky. Better to only update if explicitly provided.
            excerpt,
            content,
            featured_image: featuredImage,
            category_id: categoryId,
            tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
            status
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: getMessage('NOT_FOUND')
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blog post updated successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete blog post (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await BlogModel.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: getMessage('NOT_FOUND')
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost
};

