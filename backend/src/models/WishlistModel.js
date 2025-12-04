const db = require('../config/db');

class WishlistModel {
    /**
     * Add product to user's wishlist
     */
    static async addToWishlist(userId, productId) {
        try {
            const [result] = await db.query(
                `INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`,
                [userId, productId]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Product already in wishlist');
            }
            throw error;
        }
    }

    /**
     * Remove product from user's wishlist
     */
    static async removeFromWishlist(userId, productId) {
        const [result] = await db.query(
            `DELETE FROM wishlist WHERE user_id = ? AND product_id = ?`,
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get user's wishlist with product details
     * Avoids SELECT * by fetching only necessary fields
     */
    static async getWishlist(userId) {
        const sql = `
      SELECT 
        w.id as wishlist_id,
        w.product_id,
        w.created_at as added_at,
        p.name,
        p.slug,
        p.price,
        p.compare_price,
        p.in_stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `;

        const [rows] = await db.query(sql, [userId]);
        return rows;
    }

    /**
     * Check if product is in wishlist
     */
    static async isInWishlist(userId, productId) {
        const [rows] = await db.query(
            `SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?`,
            [userId, productId]
        );
        return rows.length > 0;
    }
}

module.exports = WishlistModel;
