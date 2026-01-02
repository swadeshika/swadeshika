const db = require('../config/db');

/**
 * Dashboard Model
 * Handles complex aggregate queries for admin dashboard and reports
 */
class DashboardModel {
    /**
     * Get Key Performance Indicators (KPIs)
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Object>}
     */
    static async getKPIs(startDate, endDate) {
        const query = `
            SELECT 
                COALESCE(SUM(total_amount), 0) as revenue,
                COUNT(*) as orders
            FROM orders 
            WHERE created_at BETWEEN ? AND ? 
            AND status != 'cancelled'
        `;
        const [orderStats] = await db.query(query, [startDate, endDate]);

        const [productStats] = await db.query('SELECT COUNT(*) as products FROM products WHERE is_active = TRUE');

        const [customerStats] = await db.query(
            'SELECT COUNT(*) as customers FROM users WHERE role = "customer" AND created_at BETWEEN ? AND ?',
            [startDate, endDate]
        );

        return {
            revenue: orderStats[0].revenue,
            orders: orderStats[0].orders,
            products: productStats[0].products,
            customers: customerStats[0].customers
        };
    }

    /**
     * Get orders grouped by status
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getOrdersByStatus(startDate, endDate) {
        const query = `
            SELECT status, COUNT(*) as count 
            FROM orders 
            WHERE created_at BETWEEN ? AND ? 
            GROUP BY status
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        return rows;
    }

    /**
     * Get sales grouped by category
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getSalesByCategory(startDate, endDate) {
        const query = `
            SELECT c.name, SUM(oi.subtotal) as value
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY c.id, c.name
            ORDER BY value DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        return rows;
    }

    /**
     * Get top customers by spending
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getTopCustomers(startDate, endDate) {
        const query = `
            SELECT COALESCE(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), u.name) as name, SUM(o.total_amount) as spent, COUNT(o.id) as orders
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY u.id, u.name, c.first_name
            ORDER BY spent DESC
            LIMIT 5
        `;

        try {
            const [rows] = await db.query(query, [startDate, endDate]);
            return rows;
        } catch (err) {
            // If `customers` table doesn't exist (some deployments), fall back to a simplified query
            if (err.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/.test(err.message || '')) {
                const alt = `
                    SELECT u.name as name, SUM(o.total_amount) as spent, COUNT(o.id) as orders
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.created_at BETWEEN ? AND ?
                    AND o.status != 'cancelled'
                    GROUP BY u.id, u.name
                    ORDER BY spent DESC
                    LIMIT 5
                `;
                const [rows2] = await db.query(alt, [startDate, endDate]);
                return rows2;
            }
            throw err;
        }
    }

    /**
     * Get top selling products
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getTopProducts(startDate, endDate) {
        const query = `
            SELECT p.name, SUM(oi.quantity) as sales, SUM(oi.subtotal) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY p.id, p.name
            ORDER BY sales DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        return rows;
    }

    /**
     * Get recent orders
     * @returns {Promise<Array>}
     */
    static async getRecentOrders() {
        const query = `
            SELECT o.id, o.order_number, 
                   COALESCE(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), u.name) as customer, 
                   o.total_amount as amount, o.status, o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
            ORDER BY o.created_at DESC
            LIMIT 5
        `;

        try {
            const [rows] = await db.query(query);
            return rows;
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/.test(err.message || '')) {
                const alt = `
                    SELECT o.id, o.order_number, u.name as customer, o.total_amount as amount, o.status, o.created_at
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    ORDER BY o.created_at DESC
                    LIMIT 5
                `;
                const [rows2] = await db.query(alt);
                return rows2;
            }
            throw err;
        }
    }

    /**
     * Get low stock products
     * @returns {Promise<Array>}
     */
    static async getLowStockProducts() {
        const query = `
            SELECT 
                p.name, 
                p.stock_quantity as stock, 
                p.low_stock_threshold as threshold,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
            FROM products p
            WHERE p.stock_quantity <= p.low_stock_threshold
            AND p.is_active = TRUE
            LIMIT 5
        `;
        const [rows] = await db.query(query);
        return rows;
    }
    /**
     * Get payment methods usage
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getPaymentMethods(startDate, endDate) {
        const query = `
            SELECT payment_method as name, COUNT(*) as value
            FROM orders
            WHERE created_at BETWEEN ? AND ?
            AND status != 'cancelled'
            GROUP BY payment_method
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        return rows;
    }

    /**
     * Get coupon performance
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async getCouponPerformance(startDate, endDate) {
        const query = `
            SELECT 
                c.code, 
                COUNT(cu.id) as 'usage', 
                c.usage_limit as 'limit', 
                COALESCE(SUM(o.total_amount), 0) as revenue
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
            LEFT JOIN orders o ON cu.order_id = o.id
            WHERE cu.used_at BETWEEN ? AND ?
            GROUP BY c.id
            ORDER BY revenue DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        return rows;
    }

    static async getReturns(startDate, endDate) {
        // Return Rate
        const [totalOrders] = await db.query(
            'SELECT COUNT(*) as count FROM orders WHERE created_at BETWEEN ? AND ?',
            [startDate, endDate]
        );
        const [returnedOrders] = await db.query(
            'SELECT COUNT(*) as count FROM orders WHERE created_at BETWEEN ? AND ? AND (status = "refunded" OR status = "cancelled")',
            [startDate, endDate]
        );

        // Refunded Amount
        const [refundedAmount] = await db.query(
            'SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders WHERE created_at BETWEEN ? AND ? AND status = "refunded"',
            [startDate, endDate]
        );

        // Avg Resolution Time (for delivered orders)
        const [resolutionTime] = await db.query(
            `SELECT COALESCE(AVG(TIMESTAMPDIFF(SECOND, created_at, delivered_at)), 0) as avg_seconds 
             FROM orders 
             WHERE created_at BETWEEN ? AND ? 
             AND status = "delivered" AND delivered_at IS NOT NULL`,
            [startDate, endDate]
        );

        return {
            total: totalOrders[0].count,
            returned: returnedOrders[0].count,
            refundedAmount: refundedAmount[0].amount,
            avgResolutionSeconds: resolutionTime[0].avg_seconds
        };
    }
}

module.exports = DashboardModel;
