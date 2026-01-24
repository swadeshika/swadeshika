const CouponService = require('../services/couponService');

/**
 * CouponController
 * Handles coupon management and validation.
 */
class CouponController {
    /**
     * Get all coupons
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getAllCoupons(req, res, next) {
        try {
            const coupons = await CouponService.getAllCoupons();
            res.json({ success: true, data: coupons });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single coupon by ID
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getCoupon(req, res, next) {
        try {
            const coupon = await CouponService.getCoupon(req.params.id);
            res.json({ success: true, data: coupon });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new coupon
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async createCoupon(req, res, next) {
        try {
            const coupon = await CouponService.createCoupon(req.body);
            res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update an existing coupon
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async updateCoupon(req, res, next) {
        try {
            const coupon = await CouponService.updateCoupon(req.params.id, req.body);
            res.json({ success: true, message: 'Coupon updated', data: coupon });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a coupon
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async deleteCoupon(req, res, next) {
        try {
            await CouponService.deleteCoupon(req.params.id);
            res.json({ success: true, message: 'Coupon deleted' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate a coupon code for checkout
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async validateCoupon(req, res, next) {
        try {
            const { code, orderTotal, cartItems } = req.body;
            const userId = req.user ? req.user.id : null;
            const result = await CouponService.validateCoupon(code, orderTotal, userId, cartItems);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available coupons
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getAvailableCoupons(req, res, next) {
        try {
            const coupons = await CouponService.getAvailableCoupons();
            res.json({ success: true, data: coupons });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CouponController;
