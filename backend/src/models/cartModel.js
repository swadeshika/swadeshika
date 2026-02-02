const db = require('../config/db');

/**
 * cartModel.js
 * ------------
 * Database interactions for Shopping Cart.
 * Table: cart_items
 */
class CartModel {
    /**
     * Get all items in user's cart
     * 
     * @param {number|string} userId - User ID
     * @returns {Promise<Array>} List of cart items with product details
     */
    static async getCartItems(userId) {
        const sql = `
            SELECT 
                ci.id, ci.user_id, ci.product_id, ci.variant_id, ci.quantity, ci.created_at,
                p.name as product_name, p.slug, p.price, p.compare_price, p.category_id as category_id,
                c.name as category_name,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url,
                pv.name as variant_name, pv.price as variant_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_variants pv ON ci.variant_id = pv.id
            WHERE ci.user_id = ? 
            AND p.is_active = 1
            AND (ci.variant_id IS NULL OR pv.is_active = 1)
            ORDER BY ci.created_at DESC
        `;
        const [rows] = await db.query(sql, [userId]);
        return rows.map(row => ({
            ...row,
            price: row.variant_price || row.price // Use variant price if available
        }));
    }

    /**
     * Find specific item in cart (to check duplicates)
     * 
     * @param {number|string} userId - User ID
     * @param {number|string} productId - Product ID
     * @param {number|string|null} variantId - Variant ID
     * @returns {Promise<Object|undefined>} Cart item
     */
    static async findItem(userId, productId, variantId) {
        let sql = `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`;
        const params = [userId, productId];

        if (variantId) {
            sql += ` AND variant_id = ?`;
            params.push(variantId);
        } else {
            sql += ` AND variant_id IS NULL`;
        }

        const [rows] = await db.query(sql, params);
        return rows[0];
    }

    /**
     * Find item by ID
     * 
     * @param {number|string} id - Cart Item ID
     * @returns {Promise<Object|undefined>} Cart item
     */
    static async findById(id) {
        const [rows] = await db.query(`SELECT * FROM cart_items WHERE id = ?`, [id]);
        return rows[0];
    }

    /**
     * Add item to cart
     * 
     * @param {number|string} userId - User ID
     * @param {Object} data - { productId, variantId, quantity }
     * @returns {Promise<number>} Insert ID
     */
    static async addItem(userId, data) {
        const sql = `
            INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
            VALUES (?, ?, ?, ?)
        `;
        // Normalize variantId
        let variantId = data.variantId;
        if (!variantId || variantId === 'null' || variantId === 'undefined' || variantId === '') {
            variantId = null;
        }

        // Validate variant existence if provided
        if (variantId) {
            const [variant] = await db.query('SELECT id FROM product_variants WHERE id = ?', [variantId]);
            if (variant.length === 0) {
                // Option 1: Throw error
                throw new Error('Invalid variant ID: ' + variantId);
                // Option 2: Set to null (fallback to base product) - safer?
                // msg: "Variant not found, adding base product"
                // distinct behavior: let's throw error for now so frontend knows it sent bad data.
            }
        }

        const [result] = await db.query(sql, [
            userId,
            data.productId,
            variantId,
            data.quantity
        ]);
        return result.insertId;
    }

    /**
     * Update item quantity
     * 
     * @param {number|string} id - Cart Item ID
     * @param {number} quantity - New quantity
     * @returns {Promise<boolean>} True if updated
     */
    static async updateQuantity(id, quantity) {
        const [result] = await db.query(
            `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`,
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Remove item from cart
     * 
     * @param {number|string} id - Cart Item ID
     * @returns {Promise<boolean>} True if removed
     */
    static async removeItem(id) {
        const [result] = await db.query(`DELETE FROM cart_items WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Clear user's cart
     * 
     * @param {number|string} userId - User ID
     * @returns {Promise<boolean>} True if cleared
     */
    static async clearCart(userId) {
        const [result] = await db.query(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = CartModel;
