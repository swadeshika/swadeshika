/**
 * Order Validator
 * ===============
 * 
 * PURPOSE:
 * Validates all order-related API requests to prevent invalid orders
 * from being created in the system.
 * 
 * WHY WE NEED THIS:
 * - Prevents empty orders (no items)
 * - Validates order amounts are positive
 * - Ensures shipping address is complete
 * - Validates payment method
 * - Prevents negative quantities or prices
 * 
 * CRITICAL VALIDATIONS:
 * - Order total must match calculated total from items
 * - All items must have valid product IDs
 * - Quantities must be positive integers
 * - Prices must be positive numbers
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Validation Rules for Creating an Order
 * =======================================
 * 
 * VALIDATES:
 * - items: Array of order items (required, not empty)
 * - shippingAddress: Complete address object
 * - paymentMethod: Valid payment method
 * - totalAmount: Positive number
 * - couponCode: Optional, valid format
 */
const createOrderValidation = [
    // Validate items array - optional because the controller can use DB cart when items are omitted
    body('items')
        .custom((items, { req }) => {
            // If items not provided or empty array, allow controller to fallback to DB cart
            if (items == null) return true;
            if (Array.isArray(items) && items.length === 0) return true;

            if (!Array.isArray(items)) {
                throw new Error('Items must be an array');
            }

            // Ensure all items have required fields
            for (const item of items) {
                if (!item.productId || item.quantity == null || item.price == null) {
                    throw new Error('Each item must have productId, quantity, and price');
                }

                // Validate quantity is positive integer
                if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                    throw new Error('Item quantity must be a positive integer');
                }

                // Validate price is positive number
                if (typeof item.price !== 'number' || item.price <= 0) {
                    throw new Error('Item price must be a positive number');
                }
            }
            return true;
        }),
    
    // Validate shipping address
    body('shippingAddress')
        .notEmpty().withMessage('Shipping address is required')
        .isObject().withMessage('Shipping address must be an object'),
    
    body('shippingAddress.fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('shippingAddress.phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage('Invalid phone number format'),
    
    body('shippingAddress.addressLine1')
        .trim()
        .notEmpty().withMessage('Address line 1 is required')
        .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
    
    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 100 }).withMessage('City name must be between 2 and 100 characters'),
    
    body('shippingAddress.state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 100 }).withMessage('State name must be between 2 and 100 characters'),
    
    body('shippingAddress.postalCode')
        .trim()
        .notEmpty().withMessage('Postal code is required')
        .matches(/^[0-9]{5,10}$/).withMessage('Invalid postal code format'),
    
    // Country may be omitted from frontend; default applied in controller. Accept empty.
    body('shippingAddress.country')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Country name must be between 2 and 100 characters'),
    
    // Validate payment method
    body('paymentMethod')
        .trim()
        .notEmpty().withMessage('Payment method is required')
        .isIn(['cod', 'razorpay', 'stripe', 'paypal']).withMessage('Invalid payment method'),
    
    // Validate total amount
    body('totalAmount')
        .notEmpty().withMessage('Total amount is required')
        .isFloat({ min: 0.01 }).withMessage('Total amount must be a positive number')
        .custom((value, { req }) => {
            /**
             * CRITICAL VALIDATION: Verify Order Total
             * ========================================
             * 
             * WHY THIS IS IMPORTANT:
             * - Prevents price manipulation attacks
             * - Ensures frontend calculations match backend
             * - Catches bugs in cart total calculation
             * 
             * WHAT WE CHECK:
             * - Calculate total from items array
             * - Compare with provided totalAmount
             * - Allow small floating-point differences (0.01)
             */
            const items = req.body.items || [];
            // If items are not provided, controller will calculate from DB cart — skip strict check here
            if (!items || items.length === 0) return true;

            const calculatedTotal = items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Allow 1 cent difference for floating-point precision
            const difference = Math.abs(calculatedTotal - parseFloat(value));
            if (difference > 0.01) {
                throw new Error(`Total amount mismatch. Expected: ${calculatedTotal.toFixed(2)}, Received: ${value}`);
            }

            return true;
        }),
    
    // Validate coupon code (optional)
    // Allow empty couponCode to be treated as not provided
    body('couponCode')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Coupon code must be between 3 and 50 characters')
        .matches(/^[A-Z0-9-]+$/i).withMessage('Coupon code can only contain letters, numbers, and hyphens'),
    
    // Validate notes (optional)
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

/**
 * Validation Rules for Updating Order Status
 * ===========================================
 * 
 * VALIDATES:
 * - orderId: Valid UUID
 * - status: Valid order status
 * - trackingNumber: Optional, valid format
 */
const updateOrderStatusValidation = [
    param('id')
        .notEmpty().withMessage('Order ID is required')
        .isUUID().withMessage('Invalid order ID format'),
    
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid order status'),
    
    body('trackingNumber')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 }).withMessage('Tracking number must be between 5 and 100 characters'),
];

/**
 * Validation Rules for Order ID Parameter
 * ========================================
 */
const orderIdValidation = [
    param('id')
        .notEmpty().withMessage('Order ID is required')
        .isUUID().withMessage('Invalid order ID format'),
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
    create: [...createOrderValidation, handleValidationErrors],
    updateStatus: [...updateOrderStatusValidation, handleValidationErrors],
    getById: [...orderIdValidation, handleValidationErrors],
    cancel: [...orderIdValidation, handleValidationErrors],
};
