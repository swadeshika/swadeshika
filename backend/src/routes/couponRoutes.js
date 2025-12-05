const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CouponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Coupon Routes
 * Base URL: /api/v1/coupons
 */

// Validation
const couponValidation = [
    body('code').notEmpty().withMessage('Code is required').toUpperCase(),
    body('discount_type').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discount_value').isFloat({ min: 0 }).withMessage('Invalid discount value'),
    body('min_order_amount').optional().isFloat({ min: 0 }),
    body('max_discount_amount').optional().isFloat({ min: 0 }),
    body('usage_limit').optional().isInt({ min: 0 }),
    body('valid_from').optional().isISO8601(),
    body('valid_until').optional().isISO8601()
];

// Public/User routes
/**
 * @route POST /validate
 * @desc Validate a coupon code
 * @access Private (User)
 */
router.post('/validate', authenticate, CouponController.validateCoupon);

// Admin routes
router.use(authenticate, authorize('admin'));

/**
 * @route GET /
 * @desc Get all coupons
 * @access Admin
 */
router.get('/', CouponController.getAllCoupons);

/**
 * @route GET /:id
 * @desc Get a single coupon
 * @access Admin
 */
router.get('/:id', CouponController.getCoupon);

/**
 * @route POST /
 * @desc Create a new coupon
 * @access Admin
 */
router.post('/', couponValidation, validate, CouponController.createCoupon);

/**
 * @route PUT /:id
 * @desc Update a coupon
 * @access Admin
 */
router.put('/:id', couponValidation, validate, CouponController.updateCoupon);

/**
 * @route DELETE /:id
 * @desc Delete a coupon
 * @access Admin
 */
router.delete('/:id', CouponController.deleteCoupon);

module.exports = router;
