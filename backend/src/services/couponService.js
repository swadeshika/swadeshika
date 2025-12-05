const CouponModel = require('../models/couponModel');

/**
 * Coupon Service
 * Business logic for coupons
 */
class CouponService {
    /**
     * Create a new coupon
     * @param {Object} data 
     * @returns {Promise<Object>} Created coupon
     */
    static async createCoupon(data) {
        // Check if code exists
        const existing = await CouponModel.findByCode(data.code);
        if (existing) {
            throw { statusCode: 409, message: 'Coupon code already exists' };
        }
        return await CouponModel.create(data);
    }

    /**
     * Get all coupons
     * @returns {Promise<Array>}
     */
    static async getAllCoupons() {
        return await CouponModel.findAll();
    }

    /**
     * Get a coupon by ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    static async getCoupon(id) {
        const coupon = await CouponModel.findById(id);
        if (!coupon) throw { statusCode: 404, message: 'Coupon not found' };
        return coupon;
    }

    /**
     * Update a coupon
     * @param {string} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    static async updateCoupon(id, data) {
        await this.getCoupon(id); // Check existence
        return await CouponModel.update(id, data);
    }

    /**
     * Delete a coupon
     * @param {string} id 
     * @returns {Promise<void>}
     */
    static async deleteCoupon(id) {
        await this.getCoupon(id);
        await CouponModel.delete(id);
    }

    /**
     * Validate coupon for a cart/order
     * @param {string} code 
     * @param {number} orderTotal 
     * @param {string} userId 
     * @param {Array} cartItems - [{ product_id, category_id, price, quantity }]
     * @returns {Promise<Object>} { isValid, coupon, discountAmount }
     */
    static async validateCoupon(code, orderTotal, userId, cartItems = []) {
        const coupon = await CouponModel.findByCode(code);
        if (!coupon) {
            throw { statusCode: 404, message: 'Invalid coupon code' };
        }

        if (!coupon.is_active) {
            throw { statusCode: 400, message: 'Coupon is inactive' };
        }

        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
            throw { statusCode: 400, message: 'Coupon is not yet valid' };
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < now) {
            throw { statusCode: 400, message: 'Coupon has expired' };
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw { statusCode: 400, message: 'Coupon usage limit reached' };
        }

        if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
            throw { statusCode: 400, message: `Minimum order amount of ₹${coupon.min_order_amount} required` };
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (orderTotal * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }

        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
            discount = coupon.max_discount_amount;
        }

        // Ensure discount doesn't exceed total
        if (discount > orderTotal) {
            discount = orderTotal;
        }

        return {
            isValid: true,
            coupon,
            discountAmount: discount
        };
    }
}

module.exports = CouponService;
