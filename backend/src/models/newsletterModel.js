const db = require('../config/db');

/**
 * NewsletterModel
 * Interacts with newsletter_subscribers table.
 */
class NewsletterModel {
    /**
     * Subscribe an email
     * Handles new subscriptions and reactivation of unsubscribed emails.
     * @param {string} email 
     * @returns {Promise<Object>} { id, status }
     */
    static async subscribe(email) {
        // Check if exists
        const [existing] = await db.query('SELECT * FROM newsletter_subscribers WHERE email = ?', [email]);

        if (existing.length > 0) {
            if (!existing[0].is_active) {
                // Reactivate
                await db.query('UPDATE newsletter_subscribers SET is_active = TRUE, unsubscribed_at = NULL WHERE id = ?', [existing[0].id]);
                return { id: existing[0].id, status: 'reactivated' };
            }
            return { id: existing[0].id, status: 'already_subscribed' };
        }

        const [result] = await db.query(
            'INSERT INTO newsletter_subscribers (email) VALUES (?)',
            [email]
        );
        return { id: result.insertId, status: 'subscribed' };
    }

    /**
     * Unsubscribe an email
     * @param {string} email 
     * @returns {Promise<boolean>}
     */
    static async unsubscribe(email) {
        await db.query(
            'UPDATE newsletter_subscribers SET is_active = FALSE, unsubscribed_at = NOW() WHERE email = ?',
            [email]
        );
        return true;
    }

    /**
     * Find all subscribers with pagination
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>} { subscribers, total, page, limit, pages }
     */
    static async findAll({ page = 1, limit = 20, isActive }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM newsletter_subscribers';
        let countQuery = 'SELECT COUNT(*) as total FROM newsletter_subscribers';
        const params = [];

        if (isActive !== undefined) {
            const status = isActive === 'true' || isActive === true;
            query += ' WHERE is_active = ?';
            countQuery += ' WHERE is_active = ?';
            params.push(status);
        }

        query += ' ORDER BY subscribed_at ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [subscribers] = await db.query(query, params);

        // For count query, we only need the status param if it exists
        const countParams = isActive !== undefined ? [isActive === 'true' || isActive === true] : [];
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        return { subscribers, total, page, limit, pages: Math.ceil(total / limit) };
    }
    /**
     * Delete a subscriber
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = NewsletterModel;
