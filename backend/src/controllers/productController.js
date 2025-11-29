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

/**
 * Create new product
 * @route POST /api/v1/products
 */
exports.createProduct = async (req, res, next) => {
    try {
        // TODO: Add validation result check here if using express-validator in routes

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
