const db = require('../config/db');

/**
 * AnalyticsModel
 * Interacts with visitor_logs and site_analytics tables.
 */
class AnalyticsModel {
    /**
     * Increment visitor count and log visit
     * @param {string} ip - Visitor IP address
     * @param {string} userAgent - Visitor User-Agent string
     * @param {string} path - Page path visited
     * @returns {Promise<number>} New visitor count
     */
    static async incrementVisitorCount(ip, userAgent, path) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Log the visit
            await connection.query(
                'INSERT INTO visitor_logs (ip_address, user_agent, page_url) VALUES (?, ?, ?)',
                [ip, userAgent, path]
            );

            // Increment counter
            // We use ON DUPLICATE KEY UPDATE to handle initialization if migration didn't run
            await connection.query(
                `INSERT INTO site_analytics (metric_key, metric_value) VALUES ('visitor_count', 1)
                 ON DUPLICATE KEY UPDATE metric_value = metric_value + 1`
            );

            await connection.commit();
            
            // Return new count
            const [rows] = await connection.query("SELECT metric_value FROM site_analytics WHERE metric_key = 'visitor_count'");
            return rows[0] ? rows[0].metric_value : 1;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get current visitor count
     * @returns {Promise<number>} Current count
     */
    static async getVisitorCount() {
        const [rows] = await db.query("SELECT metric_value FROM site_analytics WHERE metric_key = 'visitor_count'");
        return rows.length > 0 ? rows[0].metric_value : 0;
    }
}

module.exports = AnalyticsModel;
