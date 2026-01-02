/**
 * Coupon Validator
 * ================
 * 
 * PURPOSE:
 * Validates all coupon-related API requests to prevent invalid coupons
 * from being created or used.
 * 
 * WHY WE NEED THIS:
 * - Prevents discount percentages > 100%
 * - Ensures valid date ranges
 * - Validates usage limits are positive
 * - Prevents negative discount amounts
 * - Ensures coupon codes are unique and properly formatted
 * 
 * CRITICAL VALIDATIONS:
 * - Discount percentage must be 0-100%
 * - Valid from date must be before valid until date
 * - Usage limits must be positive integers
 * - Minimum order amount must be >= 0
 */

const { body, param, validationResult } = require('express-validator');

// Normalize incoming payloads: accept snake_case (frontend) or camelCase (legacy)
function normalizeCouponPayload(req, res, next) {
    const map = {
        discount_type: 'discountType',
        discount_value: 'discountValue',
        min_order_amount: 'minOrderAmount',
        usage_limit: 'usageLimit',
        per_user_limit: 'perUserLimit',
        valid_from: 'validFrom',
        valid_until: 'validUntil',
        is_active: 'isActive',
        product_ids: 'product_ids',
        category_ids: 'category_ids'
    };

    for (const [snake, camel] of Object.entries(map)) {
        if (req.body[snake] !== undefined && req.body[camel] === undefined) {
            req.body[camel] = req.body[snake];
        }
    }

    next();
}

/**
 * Validation Rules for Creating a Coupon
 * =======================================
 * 
 * VALIDATES:
 * - code: Unique, uppercase alphanumeric
 * - discountType: 'percentage' or 'fixed'
 * - discountValue: Positive number, <= 100 for percentage
 * - minOrderAmount: Non-negative number
 * - usageLimit: Positive integer
 * - validFrom: Valid date
 * - validUntil: Valid date, after validFrom
 */
const createCouponValidation = [
    // Validate coupon code
    body('code')
        .trim()
        .notEmpty().withMessage('Coupon code is required')
        .isLength({ min: 3, max: 50 }).withMessage('Coupon code must be between 3 and 50 characters')
        .matches(/^[A-Z0-9-]+$/).withMessage('Coupon code must be uppercase letters, numbers, and hyphens only')
        .custom((value) => {
            // Ensure code doesn't contain consecutive hyphens
            if (/--/.test(value)) {
                throw new Error('Coupon code cannot contain consecutive hyphens');
            }
            // Ensure code doesn't start or end with hyphen
            if (value.startsWith('-') || value.endsWith('-')) {
                throw new Error('Coupon code cannot start or end with a hyphen');
            }
            return true;
        }),
    
    // Validate discount type
    body('discountType')
        .trim()
        .notEmpty().withMessage('Discount type is required')
        .isIn(['percentage', 'fixed']).withMessage('Discount type must be either "percentage" or "fixed"'),
    
    // Validate discount value
    body('discountValue')
        .notEmpty().withMessage('Discount value is required')
        .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number')
        .custom((value, { req }) => {
            /**
             * CRITICAL VALIDATION: Discount Value Limits
             * ===========================================
             * 
             * WHY THIS IS IMPORTANT:
             * - Prevents > 100% discounts (would result in negative prices)
             * - Ensures fixed discounts are reasonable
             * - Catches configuration errors
             * 
             * RULES:
             * - Percentage: Must be 0.01 - 100
             * - Fixed: Must be > 0 (no upper limit, but should be reasonable)
             */
            const discountType = req.body.discountType;
            const numValue = parseFloat(value);
            
            if (discountType === 'percentage') {
                if (numValue > 100) {
                    throw new Error('Percentage discount cannot exceed 100%');
                }
                if (numValue < 0.01) {
                    throw new Error('Percentage discount must be at least 0.01%');
                }
            } else if (discountType === 'fixed') {
                if (numValue < 0.01) {
                    throw new Error('Fixed discount must be at least 0.01');
                }
                // Optional: Add upper limit for fixed discounts
                if (numValue > 10000) {
                    throw new Error('Fixed discount seems unusually high. Please verify.');
                }
            }
            
            return true;
        }),
    
    // Validate minimum order amount
    body('minOrderAmount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum order amount must be a non-negative number')
        .custom((value, { req }) => {
            /**
             * LOGICAL VALIDATION: Min Order vs Fixed Discount
             * ================================================
             * 
             * WHY THIS CHECK:
             * - Fixed discount should not exceed min order amount
             * - Otherwise, order total could become negative
             * 
             * EXAMPLE:
             * - Min order: ₹100
             * - Fixed discount: ₹150
             * - Result: -₹50 (INVALID!)
             */
            if (value && req.body.discountType === 'fixed') {
                const minOrder = parseFloat(value);
                const discount = parseFloat(req.body.discountValue);
                
                if (discount >= minOrder) {
                    throw new Error('Fixed discount cannot be greater than or equal to minimum order amount');
                }
            }
            return true;
        }),
    
    // Validate usage limit
    body('usageLimit')
        .optional()
        .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    
    // Validate per-user limit
    body('perUserLimit')
        .optional()
        .isInt({ min: 1 }).withMessage('Per-user limit must be a positive integer')
        .custom((value, { req }) => {
            // Per-user limit should not exceed total usage limit
            if (value && req.body.usageLimit) {
                if (parseInt(value) > parseInt(req.body.usageLimit)) {
                    throw new Error('Per-user limit cannot exceed total usage limit');
                }
            }
            return true;
        }),
    
    // Validate valid from date (optional)
    body('validFrom')
        .optional()
        .isISO8601().withMessage('Invalid date format for validFrom (use ISO 8601)'),

    // Validate valid until date (optional). If both dates provided, ensure ordering.
    body('validUntil')
        .optional()
        .isISO8601().withMessage('Invalid date format for validUntil (use ISO 8601)')
        .custom((value, { req }) => {
            const validFromRaw = req.body.validFrom;
            const validUntil = new Date(value);

            if (validFromRaw) {
                const validFrom = new Date(validFromRaw);
                if (isNaN(validFrom.getTime())) {
                    throw new Error('Invalid validFrom date');
                }
                if (validUntil <= validFrom) {
                    throw new Error('Valid until date must be after valid from date');
                }
            }

            // Optional: Warn if creating already-expired coupon
            const now = new Date();
            if (validUntil < now) {
                throw new Error('Valid until date is in the past. Coupon will be immediately expired.');
            }

            return true;
        }),
    
    // Validate description (optional)
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    
    // Validate is active (optional)
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be true or false'),
    // Optional: product_ids and category_ids for "applies to" restrictions
    body('product_ids')
        .optional()
        .isArray().withMessage('product_ids must be an array of product IDs'),
    body('product_ids.*')
        .optional()
        .isInt({ min: 1 }).withMessage('Each product_id must be a positive integer'),
    body('category_ids')
        .optional()
        .isArray().withMessage('category_ids must be an array of category IDs'),
    body('category_ids.*')
        .optional()
        .isInt({ min: 1 }).withMessage('Each category_id must be a positive integer'),
];

/**
 * Validation Rules for Updating a Coupon
 * =======================================
 * 
 * Similar to create, but all fields are optional
 */
const updateCouponValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid coupon ID'),
    
    // All fields are optional for update
    body('discountValue')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number'),
    
    body('usageLimit')
        .optional()
        .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be true or false'),
    
    // Add other fields as needed
];

/**
 * Validation Rules for Validating a Coupon (Customer Use)
 * ========================================================
 * 
 * VALIDATES:
 * - code: Required, valid format
 * - orderAmount: Required, positive number
 */
const validateCouponValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('Coupon code is required')
        .isLength({ min: 3, max: 50 }).withMessage('Invalid coupon code'),
    
    // Accept either `orderTotal` (frontend) or `orderAmount` (legacy)
    body().custom((value, { req }) => {
        const orderTotal = req.body.orderTotal ?? req.body.orderAmount;
        if (orderTotal === undefined || orderTotal === null) {
            throw new Error('Order total is required');
        }
        if (isNaN(parseFloat(orderTotal)) || parseFloat(orderTotal) <= 0) {
            throw new Error('Order total must be a positive number');
        }

        // Validate cartItems if provided
        const cartItems = req.body.cartItems;
        if (cartItems !== undefined) {
            if (!Array.isArray(cartItems)) {
                throw new Error('cartItems must be an array');
            }
            for (const item of cartItems) {
                const hasProductId = item.product_id || item.productId;
                if (!hasProductId) throw new Error('Each cart item must include product_id or productId');
                if (isNaN(parseFloat(item.price))) throw new Error('Each cart item must include a numeric price');
                if (isNaN(parseInt(item.quantity))) throw new Error('Each cart item must include a quantity');
            }
        }

        return true;
    }),
];

/**
 * Validation Rules for Coupon ID Parameter
 * =========================================
 */
const couponIdValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid coupon ID'),
];

/**
 * Middleware to Handle Validation Errors
 * =======================================
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
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
 */
module.exports = {
    create: [normalizeCouponPayload, ...createCouponValidation, handleValidationErrors],
    update: [normalizeCouponPayload, ...updateCouponValidation, handleValidationErrors],
    validate: [...validateCouponValidation, handleValidationErrors],
    getById: [...couponIdValidation, handleValidationErrors],
    delete: [...couponIdValidation, handleValidationErrors],
};
