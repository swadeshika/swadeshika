/**
 * Product Validator
 * =================
 * 
 * PURPOSE:
 * Validates all product-related API requests to prevent invalid data
 * from reaching the database.
 * 
 * WHY WE NEED THIS:
 * - Prevents negative prices, invalid stock quantities
 * - Ensures required fields are present
 * - Validates data types and formats
 * - Returns clear error messages to frontend
 * 
 * USAGE:
 * Import in productRoutes.js and add to route middleware:
 * router.post('/products', productValidator.create, productController.create)
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Validation Rules for Creating a Product
 * ========================================
 * 
 * VALIDATES:
 * - name: Required, 3-200 characters
 * - description: Optional, max 2000 characters
 * - price: Required, positive number
 * - comparePrice: Optional, must be >= price (if provided)
 * - stock: Required, non-negative integer
 * - categoryId: Required, positive integer
 * - sku: Optional, alphanumeric with hyphens
 * - weight: Optional, positive number
 * - isActive: Optional, boolean
 */
const createProductValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 50000000 }).withMessage('Description cannot exceed 50000000 characters'),

    body('short_description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01 }).withMessage('Price must be a positive number')
        .custom((value) => {
            // Ensure price has max 2 decimal places
            if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
                throw new Error('Price can have maximum 2 decimal places');
            }
            return true;
        }),

    body('compare_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Compare price must be a positive number')
        .custom((value, { req }) => {
            // Compare price should be >= regular price (for showing discount)
            if (value && parseFloat(value) < parseFloat(req.body.price)) {
                throw new Error('Compare price must be greater than or equal to regular price');
            }
            return true;
        }),

    body('stock_quantity')
        .notEmpty().withMessage('Stock quantity is required')
        .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),

    body('category_id')
        .notEmpty().withMessage('Category is required')
        .isInt({ min: 1 }).withMessage('Invalid category ID'),

    body('sku')
        .optional()
        .trim()
        .matches(/^[A-Z0-9-]+$/i).withMessage('SKU can only contain letters, numbers, and hyphens'),

    body('weight')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Weight must be a positive number'),

    body('weight_unit')
        .optional()
        .isIn(['kg', 'g', 'lb', 'oz']).withMessage('Invalid weight unit'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be true or false'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),

    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Each tag must be between 2 and 50 characters'),
];

/**
 * Validation Rules for Updating a Product
 * ========================================
 * 
 * Similar to create, but all fields are optional
 * (allows partial updates)
 */
const updateProductValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid product ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),

    body('stock_quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),

    // Add other fields as needed (same rules as create, but optional)
];

/**
 * Validation Rules for Product ID Parameter
 * ==========================================
 * 
 * Used for GET, DELETE operations
 */
const productIdValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid product ID'),
];

/**
 * Middleware to Handle Validation Errors
 * =======================================
 * 
 * WHAT IT DOES:
 * - Checks if validation failed
 * - Returns 422 status with detailed error messages
 * - Formats errors in consistent structure
 * 
 * RESPONSE FORMAT:
 * {
 *   success: false,
 *   message: "Validation failed",
 *   errors: [
 *     { field: "price", message: "Price must be positive" },
 *     { field: "stock", message: "Stock is required" }
 *   ]
 * }
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors for frontend consumption
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Export Validators
 * =================
 * 
 * USAGE IN ROUTES:
 * const productValidator = require('../validators/productValidator');
 * 
 * router.post('/products', 
 *   ...productValidator.create,  // Spread validation rules
 *   productController.create      // Then controller
 * );
 */
module.exports = {
    create: [...createProductValidation, handleValidationErrors],
    update: [...updateProductValidation, handleValidationErrors],
    getById: [...productIdValidation, handleValidationErrors],
    delete: [...productIdValidation, handleValidationErrors],
};
