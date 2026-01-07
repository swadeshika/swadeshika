const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Order Model
 * Handles all database operations for orders and order items.
 */
class Order {
    /**
     * Create a new order with items
     * Uses a transaction to ensure integrity.
     * @param {Object} orderData - Order details
     * @param {Array} items - Array of order items
     * @returns {Promise<Object>} Created order object
     */
    static async create(orderData, items) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const orderId = uuidv4();
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const {
                user_id,
                address_id,
                subtotal,
                discount_amount = 0,
                shipping_fee = 0,
                tax_amount = 0,
                total_amount,
                coupon_code = null,
                payment_method,
                payment_status = 'pending',
                payment_id = null,
                notes = null
            } = orderData;

            // Insert Order
            const orderParams = [
                orderId, orderNumber, user_id, address_id, subtotal, discount_amount,
                shipping_fee, tax_amount, total_amount, coupon_code, payment_method,
                payment_status, payment_id, notes
            ];
            console.log("DEBUG: Inserting Order:", orderParams);

            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
          id, order_number, user_id, address_id, subtotal, discount_amount, 
          shipping_fee, tax_amount, total_amount, coupon_code, payment_method, 
          payment_status, payment_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                orderParams
            );

            // Insert Order Items
            for (const item of items) {
                const itemParams = [
                    orderId, item.product_id, item.variant_id || null, item.product_name,
                    item.variant_name || null, item.sku, item.quantity, item.price, item.subtotal
                ];
                console.log("DEBUG: Inserting Item:", itemParams);

                await connection.execute(
                    `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, variant_name, 
            sku, quantity, price, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    itemParams
                );
            }

            await connection.commit();
            return { id: orderId, order_number: orderNumber, ...orderData, items };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Find all orders with pagination and filtering
     * @param {Object} options - { page, limit, status, userId }
     * @returns {Promise<Object>} { orders, total, page, limit, pages }
     */
    static async findAll({ page = 1, limit = 20, status, userId }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM orders';
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (userId) {
            conditions.push('user_id = ?');
            params.push(userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Count total for pagination
        const countQuery = `SELECT COUNT(*) as total FROM orders ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`;
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit.toString(), offset.toString()); // Limit and offset as strings or numbers depending on driver, usually numbers are fine but safe to pass as is if driver handles it. mysql2 handles numbers.

        // Actually, mysql2 execute params for LIMIT/OFFSET can be tricky with prepared statements sometimes requiring direct injection if not configured, but usually ? works. 
        // Let's use integers for limit/offset.

        // Re-constructing params for the main query to ensure types are correct
        const mainParams = [...params.slice(0, params.length - 2), parseInt(limit), parseInt(offset)];

        const [orders] = await db.query(query, mainParams);

        return { orders, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
    }

    /**
     * Find order by ID including items and address
     * @param {string} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const [orders] = await db.query(
            `SELECT o.*, u.email as user_email 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [id]
        );
        if (orders.length === 0) return null;

        const order = orders[0];
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

        // Fetch address details if needed, but usually address_id is enough or we join. 
        // Let's fetch address for convenience if possible, or just return what we have.
        // The requirement says "fetching the order etc", implying full details.
        const [address] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.address_id]);

        return { ...order, items, address: address[0] || null };
    }

    /**
     * Update order status
     * @param {string} id 
     * @param {string} status 
     * @returns {Promise<boolean>}
     */
    static async updateStatus(id, status, trackingNumber = null) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const updates = ['status = ?'];
        const params = [status];

        if (status === 'shipped') {
            updates.push('shipped_at = NOW()');
        } else if (status === 'delivered') {
            updates.push('delivered_at = NOW()');
        } else if (status === 'cancelled') {
            updates.push('cancelled_at = NOW()');
        }

        if (trackingNumber) {
            updates.push('tracking_number = ?');
            params.push(trackingNumber);
        }

        params.push(id);

        const [result] = await db.query(
            `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return result.affectedRows > 0;
    }

    /**
     * Delete an order
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Find orders by User ID
     * @param {string} userId 
     * @returns {Promise<Object>}
     */
    static async findByUserId(userId) {
        // This is effectively covered by findAll with userId param, but keeping a specific method if needed for simple non-paginated or specific logic.
        // For now, let's alias it or just use findAll in controller. 
        // But to match the plan "Implement findByUserId function", I'll make it a simple wrapper or specific query.
        // Let's make it return all orders for a user without pagination for "My Orders" if that's the intent, 
        // OR better, just use the same logic as findAll but default to user specific.
        // Actually, for "My Orders" usually we want pagination too. 
        // So I will implement it to just call findAll with userId.
        return this.findAll({ userId });
    }

    /**
     * Get cart items for a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getCartItems(userId) {
        const [items] = await db.query(
            `SELECT ci.*, p.name as product_name, p.sku, pv.name as variant_name, 
            CAST(COALESCE(pv.price, p.price) AS DECIMAL(10,2)) as price 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = ?`,
            [userId]
        );
        return items;
    }

    /**
     * Clear user cart
     * @param {string} userId 
     * @param {Object} connection - Optional DB connection for transaction
     */
    static async clearCart(userId, connection) {
        const query = 'DELETE FROM cart_items WHERE user_id = ?';
        if (connection) {
            await connection.execute(query, [userId]);
        } else {
            await db.query(query, [userId]);
        }
    }

    /**
     * Find order by Order Number
     * @param {string} orderNumber 
     * @returns {Promise<Object|null>}
     */
    static async findByOrderNumber(orderNumber) {
        const query = `
            SELECT o.*, u.email as user_email 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_number = ?
        `;
        const [rows] = await db.query(query, [orderNumber]);
        if (rows.length === 0) return null;

        const order = rows[0];
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const [address] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.address_id]);

        return { ...order, items, address: address[0] || null };
    }
}

module.exports = Order;
