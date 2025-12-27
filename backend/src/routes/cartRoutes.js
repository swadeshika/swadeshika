const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Cart Routes
 * Base URL: /api/v1/cart
 */

// Validation Rules
const addToCartValidation = [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateCartValidation = [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Apply authMiddleware to all cart routes
router.use(authenticate);

// Routes
/**
 * @route GET /
 * @desc Get current user's cart
 * @access Private
 */
router.get('/', CartController.getCart);

/**
 * @route POST /
 * @desc Add item to cart
 * @access Private
 */
router.post('/', addToCartValidation, validate, CartController.addToCart);

/**
 * CRITICAL FIX: Merge Cart Endpoint
 * ==================================
 * 
 * @route POST /merge
 * @desc Merge local cart items into user's cart (batch operation)
 * @access Private
 * 
 * WHAT IT DOES:
 * - Accepts array of cart items
 * - Merges all items in single transaction
 * - Detects and handles duplicates
 * - Returns complete merged cart
 * 
 * REQUEST BODY:
 * {
 *   items: [
 *     { productId: 1, variantId: null, quantity: 2 },
 *     { productId: 5, variantId: 3, quantity: 1 }
 *   ]
 * }
 */
const mergeCartValidation = [
    body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
    body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be at least 1')
];

router.post('/merge', mergeCartValidation, validate, CartController.mergeCart);

/**
 * @route PUT /:itemId
 * @desc Update cart item quantity
 * @access Private
 */
router.put('/:itemId', updateCartValidation, validate, CartController.updateCartItem);

/**
 * @route DELETE /:itemId
 * @desc Remove item from cart
 * @access Private
 */
router.delete('/:itemId', CartController.removeFromCart);

/**
 * @route DELETE /
 * @desc Clear entire cart
 * @access Private
 */
router.delete('/', CartController.clearCart);

module.exports = router;
