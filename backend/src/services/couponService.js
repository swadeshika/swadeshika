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
        // Normalize incoming keys (accept camelCase or snake_case)
        const payload = {
            code: data.code,
            description: data.description,
            discount_type: data.discount_type ?? data.discountType,
            discount_value: data.discount_value ?? data.discountValue,
            min_order_amount: data.min_order_amount ?? data.minOrderAmount,
            max_discount_amount: data.max_discount_amount ?? data.maxDiscountAmount,
            usage_limit: data.usage_limit ?? data.usageLimit,
            per_user_limit: data.per_user_limit ?? data.perUserLimit,
            valid_from: data.valid_from ?? data.validFrom,
            valid_until: data.valid_until ?? data.validUntil,
            is_active: data.is_active ?? data.isActive,
            product_ids: data.product_ids ?? data.productIds ?? [],
            category_ids: data.category_ids ?? data.categoryIds ?? []
        };

        const existing = await CouponModel.findByCode(payload.code);
        if (existing) {
            throw { statusCode: 409, message: 'Coupon code already exists' };
        }

        return await CouponModel.create(payload);
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
        // Normalize keys for update as well
        const payload = {
            code: data.code,
            description: data.description,
            discount_type: data.discount_type ?? data.discountType,
            discount_value: data.discount_value ?? data.discountValue,
            min_order_amount: data.min_order_amount ?? data.minOrderAmount,
            max_discount_amount: data.max_discount_amount ?? data.maxDiscountAmount,
            usage_limit: data.usage_limit ?? data.usageLimit,
            per_user_limit: data.per_user_limit ?? data.perUserLimit,
            valid_from: data.valid_from ?? data.validFrom,
            valid_until: data.valid_until ?? data.validUntil,
            is_active: data.is_active ?? data.isActive,
            product_ids: data.product_ids ?? data.productIds,
            category_ids: data.category_ids ?? data.categoryIds
        };

        return await CouponModel.update(id, payload);
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

        // Determine applicable amount based on product/category restrictions
        // If no restrictions, coupon applies to full orderTotal
        let applicableAmount = orderTotal;

        const productIds = (coupon.product_ids || []).map(String);
        const categoryIds = (coupon.category_ids || []).map(String);

        if ((productIds.length > 0 || categoryIds.length > 0) && Array.isArray(cartItems) && cartItems.length > 0) {
            applicableAmount = 0;
            for (const item of cartItems) {
                const itemProductId = item.product_id ?? item.productId;
                const itemCategoryId = item.category_id ?? item.categoryId;

                const pid = itemProductId !== undefined && itemProductId !== null ? String(itemProductId) : null;
                const cid = itemCategoryId !== undefined && itemCategoryId !== null ? String(itemCategoryId) : null;

                const matchesProduct = productIds.length > 0 && pid !== null && productIds.includes(pid);
                const matchesCategory = categoryIds.length > 0 && cid !== null && categoryIds.includes(cid);

                if (matchesProduct || matchesCategory) {
                    const lineTotal = (item.price || 0) * (item.quantity || 1);
                    applicableAmount += lineTotal;
                }
            }
        }

        // Check if coupon applies to any items in cart
        if ((productIds.length > 0 || categoryIds.length > 0) && applicableAmount === 0) {
            throw { statusCode: 400, message: 'This coupon does not apply to any items in your cart' };
        }

        if (coupon.min_order_amount && applicableAmount < coupon.min_order_amount) {
            throw { statusCode: 400, message: `Minimum applicable amount of ₹${coupon.min_order_amount} required` };
        }

        // Calculate discount based on applicable amount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (applicableAmount * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }

        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
            discount = coupon.max_discount_amount;
        }

        // Ensure discount doesn't exceed applicable amount
        if (discount > applicableAmount) {
            discount = applicableAmount;
        }

        return {
            isValid: true,
            coupon,
            discountAmount: discount,
            applicableAmount
        };
    }
    /**
     * Record coupon usage
     * @param {string|number} couponId 
     * @param {string} userId 
     * @param {string} orderId 
     * @param {number} discountAmount 
     */
    static async recordCouponUsage(couponId, userId, orderId, discountAmount) {
        await CouponModel.incrementUsage(couponId);
        if (userId) { // Record specific usage log if user is known
             await CouponModel.recordUsage(couponId, userId, orderId, discountAmount);
        }
    }
}

module.exports = CouponService;
