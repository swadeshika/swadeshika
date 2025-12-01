const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Order {
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
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
          id, order_number, user_id, address_id, subtotal, discount_amount, 
          shipping_fee, tax_amount, total_amount, coupon_code, payment_method, 
          payment_status, payment_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId, orderNumber, user_id, address_id, subtotal, discount_amount,
                    shipping_fee, tax_amount, total_amount, coupon_code, payment_method,
                    payment_status, payment_id, notes
                ]
            );

            // Insert Order Items
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, variant_name, 
            sku, quantity, price, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId, item.product_id, item.variant_id || null, item.product_name,
                        item.variant_name || null, item.sku, item.quantity, item.price, item.subtotal
                    ]
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

    static async findById(id) {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return null;

        const order = orders[0];
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

        // Fetch address details if needed, but usually address_id is enough or we join. 
        // Let's fetch address for convenience if possible, or just return what we have.
        // The requirement says "fetching the order etc", implying full details.
        const [address] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.address_id]);

        return { ...order, items, address: address[0] || null };
    }

    static async updateStatus(id, status) {
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

        params.push(id);

        const [result] = await db.query(
            `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

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
    static async getCartItems(userId) {
        const [items] = await db.query(
            `SELECT ci.*, p.name as product_name, p.sku, pv.name as variant_name 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = ?`,
            [userId]
        );
        return items;
    }

    static async clearCart(userId, connection) {
        const query = 'DELETE FROM cart_items WHERE user_id = ?';
        if (connection) {
            await connection.execute(query, [userId]);
        } else {
            await db.query(query, [userId]);
        }
    }
}

module.exports = Order;
