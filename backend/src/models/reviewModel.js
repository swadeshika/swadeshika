const db = require('../config/db');

/**
 * Review Model
 * Handles database interactions for product reviews
 */
class ReviewModel {
    /**
     * Create a new review
     * @param {Object} data 
     * @returns {Promise<Object>} Created review
     */
    static async create(data) {
        const {
            product_id, user_id, order_id, rating, title, comment, is_verified = false, is_approved = true
        } = data;

        const [result] = await db.query(
            `INSERT INTO reviews 
            (product_id, user_id, order_id, rating, title, comment, is_verified, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, user_id, order_id, rating, title, comment, is_verified, is_approved]
        );

        return this.findById(result.insertId);
    }

    /**
     * Find review by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Find reviews by Product ID
     * @param {number} productId 
     * @returns {Promise<Array>}
     */
    static async findByProductId(productId) {
        const query = `
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? AND r.is_approved = TRUE 
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query, [productId]);
        return rows;
    }

    /**
     * Find reviews by User ID
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async findByUserId(userId) {
        const query = `
            SELECT r.*, p.name as product_name, p.slug as product_slug, p.id as product_id
            FROM reviews r 
            JOIN products p ON r.product_id = p.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    /**
     * Check if user has already reviewed a product for an order
     * @param {string} userId 
     * @param {number} productId 
     * @param {string} orderId 
     * @returns {Promise<boolean>}
     */
    static async hasReviewed(userId, productId, orderId) {
        const query = 'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?';
        const [rows] = await db.query(query, [userId, productId, orderId]);
        return rows.length > 0;
    }

    /**
     * Get pending reviews for a user (products purchased but not reviewed)
     * This is a complex query involving orders and order_items
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getPendingReviews(userId) {
        const query = `
            SELECT 
                oi.product_id, 
                oi.product_name, 
                oi.variant_name, 
                o.id as order_id, 
                o.order_number, 
                o.delivered_at,
                pi.image_url
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = TRUE
            LEFT JOIN reviews r ON r.order_id = o.id AND r.product_id = oi.product_id
            WHERE o.user_id = ? 
            AND o.status = 'delivered'
            AND r.id IS NULL
            ORDER BY o.delivered_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = ReviewModel;
