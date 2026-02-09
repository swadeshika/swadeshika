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
                guest_email = null,
                guest_phone = null,
                address_id,
                billing_address_id = null,
                subtotal,
                discount_amount = 0,
                shipping_fee = 0,
                tax_amount = 0,
                total_amount,
                coupon_code = null,
                payment_method,
                payment_status = 'pending',
                payment_id = null,
                notes = null,
                // Snapshot fields
                shipping_full_name, shipping_phone, shipping_address_line1, shipping_address_line2,
                shipping_city, shipping_state, shipping_postal_code, shipping_country
            } = orderData;

            // Insert Order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
          id, order_number, user_id, guest_email, guest_phone, address_id, billing_address_id, subtotal, discount_amount, 
          shipping_fee, tax_amount, total_amount, coupon_code, payment_method, 
          payment_status, payment_id, notes,
          shipping_full_name, shipping_phone, shipping_address_line1, shipping_address_line2,
          shipping_city, shipping_state, shipping_postal_code, shipping_country
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId, orderNumber, user_id, guest_email, guest_phone, address_id, billing_address_id, subtotal, discount_amount,
                    shipping_fee, tax_amount, total_amount, coupon_code, payment_method,
                    payment_status, payment_id, notes,
                    shipping_full_name, shipping_phone, shipping_address_line1, shipping_address_line2,
                    shipping_city, shipping_state, shipping_postal_code, shipping_country
                ]
            );

            // Insert Order Items and Update Stock
            for (const item of items) {
                const itemParams = [
                    orderId, item.product_id, item.variant_id || null, item.product_name,
                    item.variant_name || null, item.sku, item.quantity, item.price, item.subtotal
                ];

                await connection.execute(
                    `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, variant_name, 
            sku, quantity, price, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    itemParams
                );

                // 2. Decrement Stock
                let stockResult;
                if (item.variant_id) {
                    // Update Variant Stock
                    // console.log(`[Stock] Updating variant stock: variant_id=${item.variant_id}, quantity=${item.quantity}`);
                    [stockResult] = await connection.execute(
                        `UPDATE product_variants 
                         SET stock_quantity = stock_quantity - ? 
                         WHERE id = ? AND stock_quantity >= ?`,
                        [item.quantity, item.variant_id, item.quantity]
                    );
                    // console.log(`[Stock] Variant stock update result: affectedRows=${stockResult.affectedRows}`);
                } else {
                    // Update Product Stock
                    // console.log(`[Stock] Updating product stock: product_id=${item.product_id}, quantity=${item.quantity}`);
                    [stockResult] = await connection.execute(
                        `UPDATE products 
                         SET stock_quantity = stock_quantity - ? 
                         WHERE id = ? AND stock_quantity >= ?`,
                        [item.quantity, item.product_id, item.quantity]
                    );
                    // console.log(`[Stock] Product stock update result: affectedRows=${stockResult.affectedRows}`);
                }

                // 3. Check for Insufficient Stock
                if (stockResult.affectedRows === 0) {
                    throw new Error(`Insufficient stock for product: ${item.product_name} (${item.variant_name || 'Standard'})`);
                }
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
    static async findAll({ page = 1, limit = 20, status, userId, userEmail = null }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM orders';
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (userId) {
            if (userEmail) {
                conditions.push('(user_id = ? OR (guest_email = ? AND user_id IS NULL))');
                params.push(userId, userEmail);
            } else {
                conditions.push('user_id = ?');
                params.push(userId);
            }
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

        if (orders.length > 0) {
            const orderIds = orders.map(o => o.id);
            // Fetch items for these orders
            const placeholders = orderIds.map(() => '?').join(',');
            const [items] = await db.query(
                `SELECT oi.*, pi.image_url as image 
                 FROM order_items oi
                 LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = 1
                 WHERE oi.order_id IN (${placeholders})`,
                orderIds
            );

            // Group items by order_id
            const itemsMap = {};
            items.forEach(item => {
                if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
                itemsMap[item.order_id].push(item);
            });

            // Attach items to orders
            orders.forEach(order => {
                order.items = itemsMap[order.id] || [];
            });
        }

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
        const [items] = await db.query(`
            SELECT oi.*, pi.image_url as image 
            FROM order_items oi
            LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = 1
            WHERE oi.order_id = ?
        `, [id]);

        // Fetch address details from snapshot if available, otherwise join
        let address = null;
        if (order.shipping_full_name) {
            // Use snapshot
            address = {
                id: order.address_id, // Keep ID for reference
                full_name: order.shipping_full_name,
                phone: order.shipping_phone,
                address_line1: order.shipping_address_line1,
                address_line2: order.shipping_address_line2,
                city: order.shipping_city,
                state: order.shipping_state,
                postal_code: order.shipping_postal_code,
                country: order.shipping_country
            };
        } else {
             // Fallback to address table join
             const [addrRows] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.address_id]);
             address = addrRows[0] || null;
        }
        
        let billingAddress = null;
        if (order.billing_address_id) {
             const [billing] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.billing_address_id]);
             billingAddress = billing[0] || null;
        }

        return { ...order, items, address, billingAddress };
    }

    /**
     * Update order status
     * @param {string} id 
     * @param {string} status 
     * @param {string|null} trackingNumber
     * @param {string|null} carrier
     * @returns {Promise<boolean>}
     */
    static async updateStatus(id, status, trackingNumber = null, carrier = null) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'];
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
        } else if (status === 'returned') {
            updates.push('returned_at = NOW()');
        } else if (status === 'refunded') {
            updates.push('refunded_at = NOW()');
        }

        if (trackingNumber) {
            updates.push('tracking_number = ?');
            params.push(trackingNumber);
        }

        if (carrier) {
            updates.push('carrier = ?');
            params.push(carrier);
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
            CAST(COALESCE(pv.price, p.price) AS DECIMAL(10,2)) as price,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
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
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.order_number = ?
        `;
        const [rows] = await db.query(query, [orderNumber]);
        if (rows.length === 0) return null;

        const order = rows[0];
        const [items] = await db.query(`
            SELECT oi.*, pi.image_url as image 
            FROM order_items oi
            LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = 1
            WHERE oi.order_id = ?
        `, [order.id]);
        // Fetch address details from snapshot if available, otherwise join
        let address = null;
        if (order.shipping_full_name) {
             address = {
                id: order.address_id,
                full_name: order.shipping_full_name,
                phone: order.shipping_phone,
                address_line1: order.shipping_address_line1,
                address_line2: order.shipping_address_line2,
                city: order.shipping_city,
                state: order.shipping_state,
                postal_code: order.shipping_postal_code,
                country: order.shipping_country
            };
        } else {
            const [addrRows] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.address_id]);
            address = addrRows[0] || null;
        }

        let billingAddress = null;
        if (order.billing_address_id) {
             const [billing] = await db.query('SELECT * FROM addresses WHERE id = ?', [order.billing_address_id]);
             billingAddress = billing[0] || null;
        }

        return { ...order, items, address, billingAddress };
    }
    /**
     * Link guest orders to a registered user
     * @param {string} email 
     * @param {string} userId 
     */
    static async claimGuestOrders(email, userId) {
        if (!email || !userId) return;
        
        // Find orders with this guest email
        // We update them to belong to the new user
        // We strictly check guest_email to avoid stealing other users' orders (though email should be unique per user usually)
        const [result] = await db.query(
            `UPDATE orders 
             SET user_id = ?, guest_email = NULL 
             WHERE guest_email = ?`,
            [userId, email]
        );
        return result.affectedRows;
    }
}

module.exports = Order;
