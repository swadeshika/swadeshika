const BlogModel = require('../models/blogModel');
const { slugify } = require('../utils/stringUtils');
const { getMessage } = require('../constants/messages');

/**
 * Get all blog posts
 */
const getAllPosts = async (req, res) => {
    try {
        const { page, limit, category, search, status } = req.query;
        const result = await BlogModel.findAll({ page, limit, category, search, status });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Get all posts error:', err);
        return res.status(500).json({
            success: false,
            message: getMessage('INTERNAL_SERVER_ERROR')
        });
    }
};

/**
 * Get blog post by slug
 */
const getPostBySlug = async (req, res) => {
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
        console.error('Get post by slug error:', err);
        return res.status(500).json({
            success: false,
            message: getMessage('INTERNAL_SERVER_ERROR')
        });
    }
};

/**
 * Create blog post (Admin)
 */
const createPost = async (req, res) => {
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
        console.error('Create post error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Slug already exists'
            });
        }
        return res.status(500).json({
            success: false,
            message: getMessage('INTERNAL_SERVER_ERROR')
        });
    }
};

/**
 * Update blog post (Admin)
 */
const updatePost = async (req, res) => {
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
        console.error('Update post error:', err);
        return res.status(500).json({
            success: false,
            message: getMessage('INTERNAL_SERVER_ERROR')
        });
    }
};

/**
 * Delete blog post (Admin)
 */
const deletePost = async (req, res) => {
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
        console.error('Delete post error:', err);
        return res.status(500).json({
            success: false,
            message: getMessage('INTERNAL_SERVER_ERROR')
        });
    }
};

module.exports = {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost
};
