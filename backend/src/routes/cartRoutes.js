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
