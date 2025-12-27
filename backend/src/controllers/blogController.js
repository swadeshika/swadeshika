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
// fs and path removed
const createPost = async (req, res, next) => {
    try {
        console.log('createPost called with body:', JSON.stringify(req.body).substring(0, 100) + '...');

        const { title, content, excerpt, featured_image, category, category_id, tags, status, author_id, published_at } = req.body;
        const authorId = author_id || 1; // Default to Admin Author ID 1 if not provided

        // Generate slug from title if not provided
        const slug = req.body.slug || slugify(title);

        // Determine Category ID
        let categoryId = category_id;

        // Fallback to 'category' field if category_id not provided
        if (!categoryId) {
            const categoryInput = category || 'swadeshika';
            if (typeof categoryInput === 'string' && isNaN(categoryInput)) {
                categoryId = await BlogModel.getCategoryIdByName(categoryInput);
                if (!categoryId) {
                    categoryId = await BlogModel.createCategory(categoryInput);
                }
            } else {
                categoryId = categoryInput;
            }
        }

        console.log('Creating post:', { title, slug, authorId, categoryId, status });

        const newPostId = await BlogModel.create({
            title,
            slug,
            excerpt: excerpt || null,
            content,
            featured_image: featured_image || null,
            author_id: authorId,
            category_id: categoryId,
            tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : null,
            status: status || 'draft',
            published_at: published_at || null
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
        console.error('Error creating blog post:', err);
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
        console.log('updatePost called with body:', JSON.stringify(req.body).substring(0, 100) + '...');

        const { id } = req.params;
        const { title, content, excerpt, featuredImage, category, category_id, tags, status, slug, author_id, published_at } = req.body;

        // Determine Category ID
        let categoryId = category_id;

        if (!categoryId && category) {
            if (typeof category === 'string' && isNaN(category)) {
                categoryId = await BlogModel.getCategoryIdByName(category);
            } else {
                categoryId = category;
            }
        }

        // Prepare update object
        const updateData = {
            title,
            slug: slug || (title ? slugify(title) : undefined),
            excerpt: excerpt || null,
            content,
            featured_image: featuredImage || null,
            category_id: categoryId, // might be undefined if not provided, model handles it
            tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : null,
            status,
            author_id, // Allow updating author
            published_at // Allow updating published_at
        };

        console.log('Updating post', id, updateData);

        const updated = await BlogModel.update(id, updateData);

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

