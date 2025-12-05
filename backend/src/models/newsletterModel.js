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
    static async findAll({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const [subscribers] = await db.query(
            'SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM newsletter_subscribers');
        const total = countResult[0].total;

        return { subscribers, total, page, limit, pages: Math.ceil(total / limit) };
    }
}

module.exports = NewsletterModel;
