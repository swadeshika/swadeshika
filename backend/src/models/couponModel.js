const db = require('../config/db');

/**
 * Coupon Model
 * Handles database interactions for coupons
 */
class CouponModel {
    /**
     * Create a new coupon
     * @param {Object} data 
     * @returns {Promise<Object>} Created coupon
     */
    static async create(data) {
        const {
            code, description, discount_type, discount_value,
            min_order_amount, max_discount_amount, usage_limit,
            per_user_limit, valid_from, valid_until, is_active,
            product_ids = [], category_ids = []
        } = data;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `INSERT INTO coupons 
                (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, valid_from, valid_until, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, valid_from, valid_until, is_active]
            );

            const couponId = result.insertId;

            // Insert product restrictions
            if (product_ids.length > 0) {
                const productValues = product_ids.map(pid => [couponId, pid]);
                await connection.query(
                    'INSERT INTO coupon_products (coupon_id, product_id) VALUES ?',
                    [productValues]
                );
            }

            // Insert category restrictions
            if (category_ids.length > 0) {
                const categoryValues = category_ids.map(cid => [couponId, cid]);
                await connection.query(
                    'INSERT INTO coupon_categories (coupon_id, category_id) VALUES ?',
                    [categoryValues]
                );
            }

            await connection.commit();
            return this.findById(couponId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Find coupon by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM coupons WHERE id = ?', [id]);
        if (!rows.length) return null;
        
        const coupon = rows[0];
        coupon.product_ids = await this.getCouponProducts(id);
        coupon.category_ids = await this.getCouponCategories(id);
        
        return coupon;
    }

    /**
     * Find coupon by Code
     * @param {string} code 
     * @returns {Promise<Object>}
     */
    static async findByCode(code) {
        const [rows] = await db.query('SELECT * FROM coupons WHERE code = ?', [code]);
        if (!rows.length) return null;

        const coupon = rows[0];
        coupon.product_ids = await this.getCouponProducts(coupon.id);
        coupon.category_ids = await this.getCouponCategories(coupon.id);

        return coupon;
    }

    /**
     * Get all coupons
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
        // Attach product_ids and category_ids for each coupon so frontend can read "applies to" restrictions
        const results = await Promise.all(rows.map(async (r) => {
            const coupon = r;
            coupon.product_ids = await this.getCouponProducts(coupon.id);
            coupon.category_ids = await this.getCouponCategories(coupon.id);
            return coupon;
        }));
        return results;
    }

    /**
     * Update coupon
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    static async update(id, data) {
        const {
            code, description, discount_type, discount_value,
            min_order_amount, max_discount_amount, usage_limit,
            per_user_limit, valid_from, valid_until, is_active,
            product_ids, category_ids
        } = data;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Update main table
            const updateFields = [];
            const values = [];
            const fields = {
                code, description, discount_type, discount_value,
                min_order_amount, max_discount_amount, usage_limit,
                per_user_limit, valid_from, valid_until, is_active
            };

            for (const [key, value] of Object.entries(fields)) {
                if (value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updateFields.length > 0) {
                values.push(id);
                await connection.query(`UPDATE coupons SET ${updateFields.join(', ')} WHERE id = ?`, values);
            }

            // Update relations if provided
            if (product_ids !== undefined) {
                await connection.query('DELETE FROM coupon_products WHERE coupon_id = ?', [id]);
                if (product_ids.length > 0) {
                    const productValues = product_ids.map(pid => [id, pid]);
                    await connection.query('INSERT INTO coupon_products (coupon_id, product_id) VALUES ?', [productValues]);
                }
            }

            if (category_ids !== undefined) {
                await connection.query('DELETE FROM coupon_categories WHERE coupon_id = ?', [id]);
                if (category_ids.length > 0) {
                    const categoryValues = category_ids.map(cid => [id, cid]);
                    await connection.query('INSERT INTO coupon_categories (coupon_id, category_id) VALUES ?', [categoryValues]);
                }
            }

            await connection.commit();
            return this.findById(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Delete coupon
     * @param {number} id 
     */
    static async delete(id) {
        await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    }

    // Helpers
    static async getCouponProducts(couponId) {
        const [rows] = await db.query('SELECT product_id FROM coupon_products WHERE coupon_id = ?', [couponId]);
        return rows.map(r => r.product_id);
    }

    static async getCouponCategories(couponId) {
        const [rows] = await db.query('SELECT category_id FROM coupon_categories WHERE coupon_id = ?', [couponId]);
        return rows.map(r => r.category_id);
    }

    static async incrementUsage(id) {
        await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [id]);
    }

    static async recordUsage(couponId, userId, orderId, discountAmount) {
        await db.query(
            'INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)',
            [couponId, userId, orderId, discountAmount]
        );
    }
}

module.exports = CouponModel;
