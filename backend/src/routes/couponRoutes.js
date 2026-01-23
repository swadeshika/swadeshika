const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * CRITICAL FIX: Input Validation for Coupons
 * ===========================================
 * 
 * WHAT CHANGED:
 * - Replaced basic inline validation with comprehensive validator
 * - Added validation for discount percentages (max 100%)
 * - Validates date ranges (validUntil > validFrom)
 * - Prevents invalid usage limits
 * 
 * WHY THIS MATTERS:
 * - Prevents > 100% discounts
 * - Ensures valid date ranges
 * - Catches configuration errors
 */
const couponValidator = require('../validators/couponValidator');

/**
 * Coupon Routes
 * Base URL: /api/v1/coupons
 */

// Public/User routes
/**
 * @route POST /validate
 * @desc Validate a coupon code
 * @access Private (User)
 */
router.post('/validate', authenticate, couponValidator.validate, CouponController.validateCoupon);

/**
 * @route GET /available
 * @desc Get available coupons for users
 * @access Public
 */
router.get('/available', CouponController.getAvailableCoupons);

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
router.get('/:id', couponValidator.getById, CouponController.getCoupon);

/**
 * @route POST /
 * @desc Create a new coupon
 * @access Admin
 */
router.post('/', couponValidator.create, CouponController.createCoupon);

/**
 * @route PUT /:id
 * @desc Update a coupon
 * @access Admin
 */
router.put('/:id', couponValidator.update, CouponController.updateCoupon);

/**
 * @route DELETE /:id
 * @desc Delete a coupon
 * @access Admin
 */
router.delete('/:id', couponValidator.delete, CouponController.deleteCoupon);

module.exports = router;
