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
     * Find review by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0];
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

    /**
     * Get all reviews (Admin)
     * @param {Object} filters - { status }
     * @returns {Promise<Array>}
     */
    static async getAllReviews(filters = {}) {
        let sql = `
            SELECT 
                r.*, 
                u.name as user_name, 
                u.email as user_email,
                p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
        `;
        
        const params = [];
        const whereClauses = [];

        if (filters.status && filters.status !== 'all') {
            whereClauses.push('r.status = ?');
            params.push(filters.status);
        }

        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        sql += ` ORDER BY r.created_at DESC`;

        const [rows] = await db.query(sql, params);
        return rows;
    }

    /**
     * Update review status
     * @param {number} id 
     * @param {string} status 
     * @returns {Promise<Object>}
     */
    static async updateStatus(id, status) {
        // Sync is_approved for backward compatibility
        const isApproved = status === 'approved' ? 1 : 0;
        
        await db.query(
            'UPDATE reviews SET status = ?, is_approved = ? WHERE id = ?',
            [status, isApproved, id]
        );
        return { id, status, is_approved: isApproved };
    }

    /**
     * Delete review
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Get featured reviews (High rating, random)
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    static async getFeaturedReviews(limit = 3) {
        const [rows] = await db.query(
            `SELECT r.*, u.name as user_name, u.role, 
             (SELECT city FROM addresses WHERE user_id = u.id ORDER BY is_default DESC LIMIT 1) as city
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.rating = 5 AND r.is_approved = TRUE
             ORDER BY RAND()
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
}

module.exports = ReviewModel;
