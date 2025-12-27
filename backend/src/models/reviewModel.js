const db = require('../config/db');

/**
 * Review Model
 * Handles database operations for the reviews table
 */
class ReviewModel {
    /**
     * Create a new review
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const { product_id, user_id, order_id, rating, title, comment, is_verified, is_approved } = data;
        
        const [result] = await db.query(
            `INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, user_id, order_id, rating, title, comment, is_verified, is_approved]
        );
        
        return { id: result.insertId, ...data };
    }

    /**
     * Find reviews by product ID
     * @param {number} productId 
     * @returns {Promise<Array>}
     */
    static async findByProductId(productId) {
        const [rows] = await db.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.is_approved = TRUE
             ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows;
    }

    /**
     * Find reviews by user ID
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async findByUserId(userId) {
        const [rows] = await db.query(
            `SELECT r.*, p.name as product_name, p.slug as product_slug
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );
        return rows;
    }

    /**
     * Check if a user has already reviewed a product for a specific order
     * @param {string} userId 
     * @param {number} productId 
     * @param {string} orderId 
     * @returns {Promise<boolean>}
     */
    static async hasReviewed(userId, productId, orderId) {
        const [rows] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
            [userId, productId, orderId]
        );
        return rows.length > 0;
    }

    /**
     * Get pending reviews for a user (products they bought but haven't reviewed)
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getPendingReviews(userId) {
        // Find delivered order items that don't have a corresponding review
        const [rows] = await db.query(
            `SELECT oi.product_id, p.name as product_name, p.slug as product_slug, o.id as order_id, o.order_number
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN reviews r ON r.order_id = o.id AND r.product_id = oi.product_id AND r.user_id = o.user_id
             WHERE o.user_id = ? AND o.status = 'delivered' AND r.id IS NULL`,
            [userId]
        );
        return rows;
    }
}

module.exports = ReviewModel;
