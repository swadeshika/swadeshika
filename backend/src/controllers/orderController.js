const Order = require('../models/orderModel');
const db = require('../config/db');
const UserModel = require('../models/userModel');
const crypto = require('crypto');
const AddressModel = require('../models/addressModel'); // Import AddressModel

const AdminSettingsService = require('../services/adminSettingsService'); // Import AdminSettingsService

exports.createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { addressId, paymentMethod, couponCode, notes, items: bodyItems, shippingAddress } = req.body;

        // 1. Handle Address Creation if shippingAddress provided
        if (shippingAddress) {
            try {
                const newAddress = await AddressModel.create({
                    user_id: userId,
                    full_name: shippingAddress.fullName,
                    phone: shippingAddress.phone,
                    address_line1: shippingAddress.addressLine1,
                    address_line2: shippingAddress.addressLine2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.postalCode,
                    country: 'India', // Default
                    address_type: 'home', // Default
                    is_default: false
                });
                addressId = newAddress.id;
            } catch (addrErr) {
                console.error("Failed to create address:", addrErr);
                return res.status(400).json({ success: false, message: 'Invalid address data' });
            }
        }

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }

        // Validate address existence
        const addressExists = await AddressModel.findById(addressId);
        if (!addressExists) {
            return res.status(400).json({ success: false, message: 'Invalid address ID provided' });
        }

        // 2. Get items (Body Items OR Cart Items)
        let orderItems = [];
        let subtotal = 0;

        if (bodyItems && bodyItems.length > 0) {
            // Use items from request body
            orderItems = bodyItems.map(item => {
                const itemSubtotal = parseFloat(item.price) * item.quantity;
                subtotal += itemSubtotal;
                return {
                    product_id: item.productId,
                    variant_id: item.variantId || null,
                    product_name: item.productName,
                    variant_name: item.variantName || null,
                    sku: item.sku || 'N/A', // SKU might be missing in frontend model
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: itemSubtotal
                };
            });
        } else {
            // Fallback to DB Cart
            const cartItems = await Order.getCartItems(userId);
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ success: false, message: 'Cart is empty' });
            }
            orderItems = cartItems.map(item => {
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
        }

        // 3. Calculate totals (Simplified logic for now)
        const settings = await AdminSettingsService.getSettings();
        const shippingThreshold = settings ? Number(settings.free_shipping_threshold) : 500;
        const flatRate = settings ? Number(settings.flat_rate) : 50;

        const discountAmount = 0;
        const shippingFee = subtotal >= shippingThreshold ? 0 : flatRate;
        // Optional tax logic based on settings? For now assume included or 0.
        // const taxRate = settings ? Number(settings.gst_percent) : 0;
        // const taxAmount = Math.round(subtotal * (taxRate / 100));
        const taxAmount = 0;

        const totalAmount = subtotal - discountAmount + shippingFee + taxAmount;

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

        // 5. Clear Cart (Only if we used cart items, but effectively safe to try clear anyway or only if bodyItems was empty)
        // If user bought 'Buy Now' directly, maybe don't clear cart? 
        // For checkout flow, we usually clear cart.
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

        // Construct timeline
        const timeline = [
            { status: 'placed', label: 'Order Placed', date: order.created_at, completed: true },
            { status: 'confirmed', label: 'Order Confirmed', date: order.created_at, completed: true },
            { status: 'processing', label: 'Packing', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
            { status: 'shipped', label: 'Shipped', date: order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
            { status: 'delivered', label: 'Delivered', date: order.delivered_at, completed: order.status === 'delivered' }
        ];

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
                subtotal: item.subtotal,
                image: item.image // Ensure image is passed if available, though model might not select it if not in order_items. 
                // Note: order_items table usually doesn't store image, products table does. 
                // We might need to join/fetch image if frontend needs it. 
                // Previous code didn't have image in map either, but frontend uses it. 
                // Frontend has: src={item.image || "/placeholder.svg"}
                // For now, let's stick to fixing timeline.
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
            estimatedDeliveryDate: order.estimated_delivery_date || new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5)),
            createdAt: order.created_at,
            deliveredAt: order.delivered_at,
            timeline: timeline
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

        const success = await Order.updateStatus(req.params.id, status, trackingNumber);

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
 * Track order (Public)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.trackOrder = async (req, res, next) => {
    try {
        const { orderId, email } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        // Try to find by orderNumber or ID
        let order;
        if (orderId.startsWith('ORD-')) {
            order = await Order.findByOrderNumber(orderId);
        } else {
            order = await Order.findById(orderId);
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Variable strictness on email check.
        // Usually tracking pages ask for Email OR Phone to verify ownership if public.
        // For now, if email is provided, we check it.
        if (email && order.user_email && order.user_email.toLowerCase() !== email.toLowerCase()) {
            // If we joined user table we might have email, check findByOrderNumber implementation
            // findByOrderNumber does join users. findById does not in current implementation above.
            // Let's rely on findByOrderNumber returns for public tracking if possible, or just return basic info.

            // If findByOrderNumber was used it has user_email.
            // If findById was used (UUID), it might not have email directly unless we fetched it.
            // For safety, let's just return what we have if it matches, or 404/403.
            return res.status(404).json({ success: false, message: 'Order search details do not match records.' });
        }

        // Construct timeline based on status
        const timeline = [
            { status: 'placed', label: 'Order Placed', date: order.created_at, completed: true },
            { status: 'confirmed', label: 'Order Confirmed', date: order.created_at, completed: true }, // Assumed confirmed immed for now
            { status: 'processing', label: 'Packing', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
            { status: 'shipped', label: 'Shipped', date: order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
            { status: 'delivered', label: 'Delivered', date: order.delivered_at, completed: order.status === 'delivered' }
        ];

        // Format response
        res.status(200).json({
            success: true,
            data: {
                orderId: order.order_number,
                status: order.status,
                trackingNumber: order.tracking_number,
                carrier: order.carrier || 'Blue Dart',
                estimatedDelivery: order.estimated_delivery_date || new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5)),
                currentLocation: order.status === 'delivered' ? 'Delivered' : 'In Transit',
                timeline
            }
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

