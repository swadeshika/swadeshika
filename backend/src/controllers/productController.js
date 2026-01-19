// src/controllers/productController.js

const ProductService = require('../services/productService');

/**
 * Get all products
 * @route GET /api/v1/products
 */
exports.getAllProducts = async (req, res, next) => {
    try {
        const result = await ProductService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product by ID or Slug
 * @route GET /api/v1/products/:id
 */
exports.getProduct = async (req, res, next) => {
    try {
        const product = await ProductService.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

const { slugify } = require('../utils/stringUtils');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const cloudinary = require('../config/cloudinary');

// Directory where uploaded files are served from (public/uploads)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

async function saveDataUrlImage(dataUrl) {
    // dataUrl format: data:<mime-type>;base64,<data>
    const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;

    try {
        const result = await cloudinary.uploader.upload(dataUrl, {
            folder: 'swadeshika/products',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: `product-${Date.now()}-${uuidv4()}`
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null; // Fallback or handle error
    }
}

/**
 * Create new product
 * @route POST /api/v1/products
 */
exports.createProduct = async (req, res, next) => {
    try {
        // Log basic payload size to help diagnose connection-reset / packet issues
        const payloadStr = JSON.stringify(req.body || {});
        const payloadSize = Buffer.byteLength(payloadStr, 'utf8');
        console.log(`📦 [CreateProduct] Payload size: ${payloadSize} bytes`);

        // If images are passed as data URLs (base64), log their lengths (useful for debugging)
        if (req.body && Array.isArray(req.body.images)) {
            req.body.images.forEach((img, idx) => {
                const dataUrl = img && (img.image_url || img.url);
                if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                    console.log(`📷 [CreateProduct] image[${idx}] data URL length: ${dataUrl.length}`);
                }
            });
        }

        // TODO: Add validation result check here if using express-validator in routes

        // Convert any base64 data-URL images in the long description to uploaded files
        if (req.body && typeof req.body.description === 'string') {
            try {
                const dataUrlRegex = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;
                const matches = req.body.description.match(dataUrlRegex) || [];
                for (const d of matches) {
                    const publicPath = await saveDataUrlImage(d);
                    if (publicPath) {
                        req.body.description = req.body.description.split(d).join(publicPath);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to process base64 images in description:', e.message || e);
            }
        }

        // Convert any base64 images passed in the `images` array
        if (req.body && Array.isArray(req.body.images)) {
            for (const img of req.body.images) {
                const dataUrl = img && (img.image_url || img.url);
                if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                    try {
                        const publicPath = await saveDataUrlImage(dataUrl);
                        if (publicPath) {
                            if (img.image_url) img.image_url = publicPath;
                            else img.url = publicPath;
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to save data URL image:', e.message || e);
                    }
                }
            }
        }

        // Auto-generate slug if not provided
        if (!req.body.slug && req.body.name) {
            req.body.slug = slugify(req.body.name);
        }

        const productId = await ProductService.createProduct(req.body);

        // Fetch the created product to return
        const newProduct = await ProductService.getProductById(productId);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.error('❌ [CreateProduct] Error:', error);
        next(error);
    }
};

/**
 * Update product
 * @route PUT /api/v1/products/:id
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const existing = await ProductService.getProductById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Log payload size to help diagnose connection-reset / packet issues
        try {
            const payloadStr = JSON.stringify(req.body || {});
            const payloadSize = Buffer.byteLength(payloadStr, 'utf8');
            console.log(`📦 [UpdateProduct] Payload size: ${payloadSize} bytes`);
        } catch (e) {
            // ignore JSON stringify errors
        }

        // Convert any base64 data-URL images in the long description to uploaded files
        if (req.body && typeof req.body.description === 'string') {
            try {
                const dataUrlRegex = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;
                const matches = req.body.description.match(dataUrlRegex) || [];
                for (const d of matches) {
                    const publicPath = await saveDataUrlImage(d);
                    if (publicPath) {
                        req.body.description = req.body.description.split(d).join(publicPath);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to process base64 images in description (update):', e.message || e);
            }
        }

        // Convert any base64 images passed in the `images` array
        if (req.body && Array.isArray(req.body.images)) {
            for (const img of req.body.images) {
                const dataUrl = img && (img.image_url || img.url);
                if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                    try {
                        const publicPath = await saveDataUrlImage(dataUrl);
                        if (publicPath) {
                            if (img.image_url) img.image_url = publicPath;
                            else img.url = publicPath;
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to save data URL image (update):', e.message || e);
                    }
                }
            }
        }

        await ProductService.updateProduct(id, req.body);

        // Fetch updated product
        const updatedProduct = await ProductService.getProductById(id);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete product
 * @route DELETE /api/v1/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await ProductService.getProductById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await ProductService.deleteProduct(id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
