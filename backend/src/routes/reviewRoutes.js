const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ReviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Review Routes
 * Base URL: /api/v1/reviews
 */

// Validation
const reviewValidation = [
    body('product_id').isInt().withMessage('Product ID is required'),
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 100 }),
    body('comment').optional().trim()
];

// Public routes
/**
 * @route GET /featured
 * @desc Get featured random 5-star reviews
 * @access Public
 */
router.get('/featured', ReviewController.getFeaturedReviews);

/**
 * @route GET /product/:productId
 * @desc Get reviews for a product
 * @access Public
 */
router.get('/product/:productId', ReviewController.getProductReviews);

// Protected routes
router.use(authenticate);

/**
 * @route GET /
 * @desc Get all reviews (Admin)
 * @access Private/Admin
 */
router.get('/', ReviewController.getAllReviews);

/**
 * @route PATCH /:id/status
 * @desc Update review status
 * @access Private/Admin
 */
router.patch('/:id/status', ReviewController.updateStatus);

/**
 * @route DELETE /:id
 * @desc Delete review
 * @access Private/Admin
 */
router.delete('/:id', ReviewController.deleteReview);

/**
 * @route POST /
 * @desc Create a review
 * @access Private
 */
router.post('/', reviewValidation, validate, ReviewController.createReview);

/**
 * @route GET /me
 * @desc Get my reviews
 * @access Private
 */
router.get('/me', ReviewController.getMyReviews);

/**
 * @route GET /pending
 * @desc Get pending reviews for user's orders
 * @access Private
 */
router.get('/pending', ReviewController.getPendingReviews);

module.exports = router;
