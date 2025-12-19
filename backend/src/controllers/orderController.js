const Order = require('../models/orderModel');
const db = require('../config/db');
const UserModel = require('../models/userModel');
const crypto = require('crypto');

/**
 * orderController.js
 * ------------------
 * Handles all order-related operations:
 * 1. Create Order (Checkout)
 * 2. Get All Orders (Admin)
 * 3. Get My Orders (User)
 * 4. Get Order By ID
 * 5. Update Order Status (Admin)
 * 6. Cancel Order (User)
 * 7. Delete Order (Admin)
 */

/**
 * Create a new order
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createOrder = async (req, res, next) => {
    try {

        let userId = req.user && req.user.id ? req.user.id : null;
        const { addressId, paymentMethod, couponCode, notes, items: bodyItems, address: addressData, customer: customerData } = req.body;

        // If user is not authenticated, try to find or create a lightweight user record
        // using the provided customer email so orders.user_id (NOT NULL) can be populated.
        if (!userId) {
            if (customerData && customerData.email) {
                const existingUser = await UserModel.findByEmail(customerData.email);
                if (existingUser && existingUser.id) {
                    userId = existingUser.id;
                } else {
                    // Create a lightweight user for guest checkout
                    const randomPassword = crypto.randomBytes(8).toString('hex');
                    const name = `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || customerData.email;
                    const newUser = await UserModel.create({ name, email: customerData.email, password: randomPassword, phone: customerData.phone });
                    userId = newUser.id;
                }
            } else {
                return res.status(400).json({ success: false, message: 'User not authenticated and no customer email provided' });
            }
        }

        // 0. Persistence Logic: Address and Customer
        let finalAddressId = addressId;

        // Create address if not provided but data is available
        if (!finalAddressId && addressData) {
            const { v4: uuidv4 } = require('uuid');
            const newAddressId = uuidv4();
            await db.query(
                `INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, postal_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newAddressId, userId,
                    `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim(),
                    customerData?.phone || '',
                    addressData.addressLine1, addressData.addressLine2 || null,
                    addressData.city, addressData.state, addressData.pincode
                ]
            );
            finalAddressId = newAddressId;
        }



        let cartItems;

        // 1. Try to get items from request body first (Direct Checkout / Buy Now)
        if (bodyItems && Array.isArray(bodyItems) && bodyItems.length > 0) {
            cartItems = bodyItems.map(item => ({
                product_id: item.id || item.product_id, // Handle both id formats
                variant_id: item.variantId || item.variant_id || null,
                product_name: item.name || item.product_name || 'Unknown Product',
                variant_name: item.variant || item.variant_name || null,
                sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Fallback SKU
                quantity: item.quantity || 1,
                price: item.price || 0
            }));
        } else {
            // 2. Fallback to DB Cart
            cartItems = await Order.getCartItems(userId);
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 3. Calculate totals
        let subtotal = 0;
        const orderItems = cartItems.map(item => {
            const itemSubtotal = parseFloat(item.price) * item.quantity;
            subtotal += itemSubtotal;
            return {
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.product_name,
                variant_name: item.variant_name,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                subtotal: itemSubtotal
            };
        });

        // Placeholder for real coupon logic
        const discountAmount = 0;
        const shippingFee = 0; // Placeholder
        const taxAmount = 0; // Placeholder
        const totalAmount = subtotal - discountAmount + shippingFee + taxAmount;

        // If the request was unauthenticated, create/find a corresponding user record
        // so orders.user_id (NOT NULL) can reference a user and admins can link orders.
        if (!userId && customerData?.email) {
            const existingUser = await UserModel.findByEmail(customerData.email);
            if (existingUser) {
                userId = existingUser.id;
            } else {
                const randomPw = crypto.randomBytes(8).toString('hex');
                const name = `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || customerData.email;
                const newUser = await UserModel.create({ name, email: customerData.email, password: randomPw, phone: customerData.phone, role: 'customer' });
                userId = newUser.id;
            }
        }

        // Ensure customer exists in customers table for admin visibility
        if (customerData?.email) {
            const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [customerData.email]);
            if (existing.length > 0) {
                await db.query(
                    `UPDATE customers 
                     SET first_name = ?, last_name = ?, phone = ?, 
                         total_orders = total_orders + 1, 
                         total_spent = total_spent + ?, 
                         updated_at = NOW() 
                     WHERE email = ?`,
                    [customerData.firstName, customerData.lastName, customerData.phone, totalAmount || 0, customerData.email]
                );
            } else {
                await db.query(
                    'INSERT INTO customers (first_name, last_name, email, phone, join_date, total_orders, total_spent) VALUES (?, ?, ?, ?, NOW(), 1, ?)',
                    [customerData.firstName, customerData.lastName, customerData.email, customerData.phone, totalAmount || 0]
                );
            }
        }

        // 4. Create Order
        const orderData = {
            user_id: userId,
            address_id: finalAddressId, // Link finalized address ID
            subtotal,
            discount_amount: discountAmount,
            shipping_fee: shippingFee,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            coupon_code: couponCode,
            payment_method: paymentMethod,
            notes
        };

        const newOrder = await Order.create(orderData, orderItems);

        // 5. Clear Cart (only if we used the DB cart)
        if (!bodyItems) {
            await Order.clearCart(userId);
        }

        // 6. Format Response
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId: newOrder.id,
                orderNumber: newOrder.order_number,
                totalAmount: newOrder.total_amount,
                status: newOrder.status || 'pending'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all orders (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search, customer } = req.query;
        // Admin can see all orders

        const offset = (page - 1) * limit;
        // Updated query to join with users and optionally customers
        let query = `
                 SELECT o.*,
                     -- Raw user & customer fields for debugging
                     u.name AS user_name,
                     u.email AS user_email,
                     c.first_name,
                     c.last_name,
                     c.email AS customer_table_email,
                     -- Prefer customers table name; fall back to user's name then user's email for display if no customer name
                     COALESCE(NULLIF(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), ''), NULLIF(u.name, ''), u.email) AS customer_name,
                     COALESCE(c.email, u.email) AS customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id';

        const params = [];
        const conditions = [];

        if (status && status !== 'All' && status !== 'all') {
            conditions.push('o.status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)');
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        if (customer) { // Filter by specific user ID if provided
            conditions.push('o.user_id = ?');
            params.push(customer);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';

        // Count total
        const [countResult] = await db.query(countQuery, params);
        const totalItems = countResult[0].total;

        // Execute main query
        const mainParams = [...params, parseInt(limit), parseInt(offset)];
        const [rows] = await db.query(query, mainParams);

        // Map results to cleaner structure
        const orders = rows.map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            customer: {
                id: order.user_id,
                name: order.customer_name || 'Guest',
                email: order.customer_email || 'No email',
                // Debug fields
                rawUserName: order.user_name || null,
                rawUserEmail: order.user_email || null,
                customerFirstName: order.first_name || null,
                customerLastName: order.last_name || null,
                customerTableEmail: order.customer_table_email || null
            },
            totalAmount: order.total_amount,
            status: order.status,
            createdAt: order.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export orders as CSV
 */
exports.exportOrders = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        let query = `
            SELECT o.order_number, o.created_at, o.total_amount, o.status,
                   COALESCE(NULLIF(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), ''), NULLIF(u.name, ''), u.email) as display_name,
                   COALESCE(c.email, u.email) as display_email,
                   c.phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
        `;

        const params = [];
        const conditions = [];

        if (status && status !== 'All' && status !== 'all') {
            conditions.push('o.status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)');
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY o.created_at DESC';

        const [rows] = await db.query(query, params);

        // Convert to CSV
        const csvHeader = 'Order Number,Date,Customer Name,Email,Phone,Amount,Status\n';
        const csvRows = rows.map(row => {
            const date = new Date(row.created_at).toLocaleDateString();
            const name = row.display_name || 'Guest';
            return `${row.order_number},${date},"${name}",${row.display_email || ''},${row.phone || ''},${row.total_amount},${row.status}`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        res.header('Content-Type', 'text/csv');
        res.attachment(`orders_export_${Date.now()}.csv`);
        return res.send(csvContent);

    } catch (error) {
        next(error);
    }
};

/**
 * Get my orders (User)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;
        const result = await Order.findAll({ page, limit, status, userId });

        res.status(200).json({
            success: true,
            data: {
                orders: result.orders.map(order => ({
                    id: order.id,
                    orderNumber: order.order_number,
                    totalAmount: order.total_amount,
                    status: order.status,
                    createdAt: order.created_at
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        // Format response
        const formattedOrder = {
            id: order.id,
            orderNumber: order.order_number,
            status: order.status,
            paymentStatus: order.payment_status,
            items: order.items.map(item => ({
                productName: item.product_name,
                variantName: item.variant_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            })),
            address: order.address ? {
                fullName: order.address.full_name,
                phone: order.address.phone,
                addressLine1: order.address.address_line1,
                city: order.address.city,
                state: order.address.state,
                postalCode: order.address.postal_code
            } : null,
            summary: {
                subtotal: order.subtotal,
                discount: order.discount_amount,
                shipping: order.shipping_fee,
                tax: order.tax_amount,
                total: order.total_amount
            },
            trackingNumber: order.tracking_number,
            createdAt: order.created_at,
            deliveredAt: order.delivered_at
        };

        res.status(200).json({
            success: true,
            data: formattedOrder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingNumber } = req.body;
        // Note: trackingNumber update logic needs to be added to model if we want to support it
        // For now, just status as per model
        const success = await Order.updateStatus(req.params.id, status);

        if (!success) {
            return res.status(404).json({ success: false, message: 'Order not found or update failed' });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel order (User)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only owner can cancel
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
        }

        // Only pending orders can be cancelled
        if (order.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
        }

        const success = await Order.updateStatus(req.params.id, 'cancelled');

        if (!success) {
            return res.status(500).json({ success: false, message: 'Failed to cancel order' });
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete order (Admin)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteOrder = async (req, res, next) => {
    try {
        const success = await Order.delete(req.params.id);

        if (!success) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

