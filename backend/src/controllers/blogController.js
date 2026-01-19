const BlogModel = require('../models/blogModel');
const { slugify } = require('../utils/stringUtils');
const { getMessage } = require('../constants/messages');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper to upload base64 images to Cloudinary
 */
async function saveDataUrlImage(dataUrl) {
    // dataUrl format: data:<mime-type>;base64,<data>
    const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;

    try {
        const result = await cloudinary.uploader.upload(dataUrl, {
            folder: 'swadeshika/blog',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `blog-${Date.now()}-${uuidv4()}`
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
}

/**
 * Get all blog posts
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllPosts = async (req, res, next) => {
    try {
        const { page, limit, category, search, status, sortBy, sortOrder } = req.query;
        const result = await BlogModel.findAll({ page, limit, category, search, status, sortBy, sortOrder });

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
        console.log('createPost called with body:', JSON.stringify(req.body).substring(0, 100) + '...');

        let { title, content, excerpt, featured_image, category, category_id, tags, status, author_id, published_at } = req.body;
        const authorId = author_id || 1; 

        // Process featured_image if base64
        if (featured_image && featured_image.startsWith('data:')) {
            const url = await saveDataUrlImage(featured_image);
            if (url) featured_image = url;
        }

        // Process content images if base64
        if (content && typeof content === 'string') {
            try {
                const dataUrlRegex = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;
                const matches = content.match(dataUrlRegex) || [];
                for (const d of matches) {
                    const publicPath = await saveDataUrlImage(d);
                    if (publicPath) {
                        content = content.split(d).join(publicPath);
                    }
                }
            } catch (e) {
                console.warn('Failed to process blog content images:', e);
            }
        }

        const slug = req.body.slug || slugify(title);
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
        let { title, content, excerpt, featuredImage, featured_image, category, category_id, tags, status, slug, author_id, published_at } = req.body;

        // Process featured_image if base64
        let finalFeaturedImage = featured_image || featuredImage;
        if (finalFeaturedImage && finalFeaturedImage.startsWith('data:')) {
            const url = await saveDataUrlImage(finalFeaturedImage);
            if (url) finalFeaturedImage = url;
        }

        // Process content images if base64
        if (content && typeof content === 'string') {
            try {
                const dataUrlRegex = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;
                const matches = content.match(dataUrlRegex) || [];
                for (const d of matches) {
                    const publicPath = await saveDataUrlImage(d);
                    if (publicPath) {
                        content = content.split(d).join(publicPath);
                    }
                }
            } catch (e) {
                console.warn('Failed to process blog content images (update):', e);
            }
        }

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
            featured_image: finalFeaturedImage || null, // Accept both snake_case and camelCase
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
