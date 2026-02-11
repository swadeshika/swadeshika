const Order = require('../models/orderModel');
const db = require('../config/db');
const UserModel = require('../models/userModel');
const crypto = require('crypto');
const AddressModel = require('../models/addressModel'); // Import AddressModel

const AdminSettingsService = require('../services/adminSettingsService'); // Import AdminSettingsService
const CouponService = require('../services/couponService');
const sendEmail = require('../utils/email');

const PaymentService = require('../services/paymentService');

exports.createOrder = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        let { addressId, paymentMethod, couponCode, notes, items: bodyItems, shippingAddress, billingAddress, email, phone } = req.body;

        // 1. Handle Address Creation if shippingAddress provided
        if (shippingAddress) {
            try {
                // Check if identical address exists
                const existingAddress = await AddressModel.findExactMatch(userId, {
                  full_name: shippingAddress.fullName,
                  phone: shippingAddress.phone,
                  address_line1: shippingAddress.addressLine1,
                  address_line2: shippingAddress.addressLine2,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  postal_code: shippingAddress.postalCode
                });

                if (existingAddress) {
                    addressId = existingAddress.id;
                } else {
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
                }
            } catch (addrErr) {
                console.error("Failed to process address:", addrErr);
                return res.status(400).json({ success: false, message: 'Invalid address data' });
            }
        }

        // Create Billing Address
        let billingAddressId = null;
        if (billingAddress) {
            try {
                // Check for existing billing address
                 const existingBilling = await AddressModel.findExactMatch(userId, {
                    full_name: billingAddress.fullName,
                    phone: billingAddress.phone,
                    address_line1: billingAddress.addressLine1,
                    address_line2: billingAddress.addressLine2,
                    city: billingAddress.city,
                    state: billingAddress.state,
                    postal_code: billingAddress.postalCode
                });

                if (existingBilling) {
                    billingAddressId = existingBilling.id;
                } else {
                    const newBilling = await AddressModel.create({
                        user_id: userId,
                        full_name: billingAddress.fullName,
                        phone: billingAddress.phone,
                        address_line1: billingAddress.addressLine1,
                        address_line2: billingAddress.addressLine2,
                        city: billingAddress.city,
                        state: billingAddress.state,
                        postal_code: billingAddress.postalCode,
                        country: 'India',
                        address_type: 'billing', // distinguish type
                        is_default: false
                    });
                    billingAddressId = newBilling.id;
                }
            } catch (addrErr) {
                 console.error("Failed to create billing address:", addrErr);
                 // Fallback to shipping address if failing (though ideally should act stricter)
                 billingAddressId = addressId;
            }
        } else {
            // Implicitly use shipping address as billing if not provided
            billingAddressId = addressId;
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
            const productIds = [...new Set(bodyItems.map(item => item.productId))];
            const variantIds = [...new Set(bodyItems.map(item => item.variantId).filter(id => id))];

            // Verify products exist and get prices
            if (productIds.length > 0) {
                const placeholders = productIds.map(() => '?').join(',');
                const [dbProducts] = await db.query(
                    `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
                    productIds
                );

                let dbVariants = [];
                if (variantIds.length > 0) {
                    const vPlaceholders = variantIds.map(() => '?').join(',');
                    const [vRows] = await db.query(
                        `SELECT id, product_id, price FROM product_variants WHERE id IN (${vPlaceholders})`,
                        variantIds
                    );
                    dbVariants = vRows;
                }

                orderItems = bodyItems.map(item => {
                    const product = dbProducts.find(p => p.id == item.productId);
                    if (!product) {
                        throw new Error(`Product ID ${item.productId} not found`);
                    }

                    let finalPrice = Number(product.price);

                    if (item.variantId) {
                        const variant = dbVariants.find(v => v.id == item.variantId);
                        if (variant) {
                            // Variant specific price
                            const vPrice = Number(variant.price);
                            if (vPrice > 0) finalPrice = vPrice;
                        }
                    }

                    const itemSubtotal = finalPrice * item.quantity;
                    subtotal += itemSubtotal;

                    return {
                        product_id: item.productId,
                        variant_id: item.variantId || null,
                        product_name: item.productName || product.name,
                        variant_name: item.variantName || null,
                        sku: item.sku || 'N/A',
                        quantity: item.quantity,
                        price: finalPrice, // Secure Price
                        subtotal: itemSubtotal, // Secure Subtotal
                        image: item.image || null
                    };
                });
            }
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
                    subtotal: itemSubtotal,
                    image: item.image || null
                };
            });
        }

        // 3. Calculate totals
        const settings = await AdminSettingsService.getSettings();


        const shippingThreshold = (settings && settings.free_shipping_threshold != null) ? Number(settings.free_shipping_threshold) : 500;
        const flatRate = (settings && settings.flat_rate != null) ? Number(settings.flat_rate) : 50;

        // console.log(`DEBUG: Subtotal: ${subtotal}, Threshold: ${shippingThreshold}, FlatRate: ${flatRate}`);

        let discountAmount = 0;
        let appliedCouponId = null;

        // Apply Coupon if provided
        if (couponCode) {
            try {
                const couponResult = await CouponService.validateCoupon(couponCode, subtotal, userId, orderItems);
                discountAmount = couponResult.discountAmount;
                appliedCouponId = couponResult.coupon.id;
                
                // If we also want to track usage properly, we should call a method to increment usage.
                // Assuming validateCoupon doesn't increment usage, we might need a separate call or do it here.
                // Typically, usage is incremented AFTER successful order payment/creation. 
                // For now, let's assume simple validation is enough to set the price.
            } catch (err) {
                // If coupon is invalid but was sent, fail the order creation so user knows price is wrong
                return res.status(400).json({ success: false, message: `Invalid Coupon: ${err.message}` });
            }
        }
        const shippingFee = subtotal >= shippingThreshold ? 0 : flatRate;

        // Tax logic based on settings (GST %)
        const taxRate = settings ? Number(settings.gst_percent) : 0;
        const safeTaxRate = Number.isNaN(taxRate) ? 0 : taxRate;
        const taxAmount = Math.round(subtotal * (safeTaxRate / 100));

        const totalAmount = subtotal - discountAmount + shippingFee + taxAmount;

        // 4. Create Order
        const orderData = {
            user_id: userId,
            guest_email: email || null,
            guest_phone: phone || null,
            address_id: addressId, // Link finalized address ID
            billing_address_id: billingAddressId || null,
            subtotal,
            discount_amount: discountAmount,
            coupon_code: couponCode || null, // Create this field in DB if not saving
            shipping_fee: shippingFee,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            notes: notes || null, // FIX: Ensure null instead of undefined
            // Pass full address snapshot details
            shipping_full_name: shippingAddress.fullName || shippingAddress.full_name,
            shipping_phone: shippingAddress.phone,
            shipping_address_line1: shippingAddress.addressLine1 || shippingAddress.address_line1,
            shipping_address_line2: shippingAddress.addressLine2 || shippingAddress.address_line2 || null,
            shipping_city: shippingAddress.city,
            shipping_state: shippingAddress.state,
            shipping_postal_code: shippingAddress.postalCode || shippingAddress.postal_code,
            shipping_country: shippingAddress.country || 'India'
        };

        if (paymentMethod === 'razorpay') {
            orderData.status = 'pending_payment';
            orderData.payment_status = 'pending';
        }

        const newOrder = await Order.create(orderData, orderItems);

        // --- Razorpay Handler ---
        if (paymentMethod === 'razorpay') {
            try {
                // Create Razorpay Order
                const razorpayOrder = await PaymentService.createOrder(totalAmount, newOrder.order_number);
                
                // Return response immediately for frontend to handle popup
                return res.status(201).json({
                    success: true,
                    isRazorpay: true,
                    message: 'Order created, proceed to payment',
                    data: {
                        orderId: newOrder.id,
                        orderNumber: newOrder.order_number,
                        totalAmount: newOrder.total_amount,
                        razorpayOrderId: razorpayOrder.id,
                        currency: razorpayOrder.currency,
                        key: (await AdminSettingsService.getSettings()).gateway_configs?.razorpay?.apiKey
                    }
                });
            } catch (rpError) {
                console.error("Razorpay Order Creation Failed:", rpError);
                // Revert local order maybe? Or just fail. 
                // For now, let's return error but keep order as pending_payment (user can retry)
                return res.status(500).json({ success: false, message: 'Payment initialization failed. Please try COD or contact support.' });
            }
        }
        // ------------------------

        // Record Coupon Usage if applicable
        if (appliedCouponId) {
            try {
                await CouponService.recordCouponUsage(appliedCouponId, userId, newOrder.id, discountAmount);
            } catch (couponErr) {
                console.error('Failed to record coupon usage:', couponErr);
                // Don't fail the order for this, just log it
            }
        }

        // Define recipient email early for use in notifications and emails
        const recipientEmail = email || guest_email || (req.user && req.user.email);

        // 📦 Real-time Notification: New Order Alert
        try {
            const { emitToAdmins } = require('../config/socketServer');
            const NotificationModel = require('../models/notificationModel');
            
            const notification = {
                type: 'new_order',
                title: 'New Order Received',
                description: `Order #${newOrder.order_number} - ₹${totalAmount}`,
                data: {
                    orderId: newOrder.id,
                    orderNumber: newOrder.order_number,
                    totalAmount,
                    customerEmail: recipientEmail || 'Guest',
                    timestamp: new Date().toISOString()
                }
            };

            const notificationId = await NotificationModel.create(notification);
            emitToAdmins('notification', {
                id: notificationId,
                ...notification,
                read: false,
                created_at: new Date()
            });
            // console.log(`📬 New order notification sent: ${newOrder.order_number}`);
        } catch (notifErr) {
            console.error('Failed to send order notification:', notifErr);
            // Don't fail the order if notification fails
        }

        // 5. Clear Cart
        // We always clear the cart for the user after a successful order to prevent double-purchasing.
        // Even for "Buy Now", clearing the cart is often safer/expected in simple flows, 
        // or we can refine this later with a flag. For now, fixing the "Cart not clearing" bug is priority.
        if (userId) {
            await Order.clearCart(userId);
        }

        // 6. Send Confirmation Email (Async - don't block response)
        
        if (recipientEmail) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2D5F3F;">Order Confirmed!</h2>
                    <p>Namaste <strong>${shippingAddress.fullName}</strong>,</p>
                    <p>Thank you for shopping with Swadeshika. Your order has been placed successfully.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Order Number:</strong> ${newOrder.order_number}</p>
                        <p><strong>Total Amount:</strong> Rs. ${newOrder.total_amount}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
                        ${couponCode ? `<p><strong>Coupon Applied:</strong> ${couponCode} (-Rs. ${discountAmount})</p>` : ''}
                    </div>

                    <h3>Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${orderItems.map(item => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">
                                    ${item.image ? `<img src="${item.image}" width="50" style="vertical-align: middle; margin-right: 10px;" />` : ''}
                                    ${item.product_name} (${item.quantity})
                                </td>
                                <td style="padding: 10px; text-align: right;">Rs. ${item.subtotal}</td>
                            </tr>
                        `).join('')}
                        <tr>
                             <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                             <td style="padding: 10px; text-align: right;">Rs. ${subtotal}</td>
                        </tr>
                        ${discountAmount > 0 ? `
                        <tr>
                             <td style="padding: 10px; text-align: right; color: green;">Discount:</td>
                             <td style="padding: 10px; text-align: right; color: green;">- Rs. ${discountAmount}</td>
                        </tr>` : ''}
                         <tr>
                             <td style="padding: 10px; text-align: right;">Shipping:</td>
                             <td style="padding: 10px; text-align: right;">Rs. ${shippingFee}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px;">We will notify you once your order is shipped.</p>
                </div>
            `;

            sendEmail({
                email: recipientEmail,
                subject: `Order Confirmation - ${newOrder.order_number}`,
                message: `Your order ${newOrder.order_number} has been placed successfully.`,
                html: emailHtml
            }).catch(err => console.error('Failed to send customer email:', err));

            // Admin Notification
            const adminEmail = process.env.ADMIN_EMAIL || 'pradeepmadasar@gmail.com'; // Fallback to user email for now
            sendEmail({
                email: adminEmail,
                subject: `New Order Received - ${newOrder.order_number}`,
                message: `New order placed by ${recipientEmail}. Total: Rs. ${newOrder.total_amount}`,
                html: `<p>New order received from <strong>${recipientEmail}</strong> for <strong>Rs. ${newOrder.total_amount}</strong>.</p>`
            }).catch(err => console.error('Failed to send admin email:', err));
        }

        // 7. Format Response
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
 * Verify Razorpay Payment
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        const isValid = await PaymentService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Update Order
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Update status
        await db.query(`UPDATE orders SET status = 'processing', payment_status = 'paid', updated_at = NOW() WHERE id = ?`, [orderId]);

        // Send Email & Notification (Logic duplicated from createOrder - ideally refactor to helper)
        const recipientEmail = order.guest_email || (req.user && req.user.email); // User might not be in req if public endpoint, but we can fetch user from order.user_id if needed
        
        // Refetch updated order for email
        const updatedOrder = await Order.findById(orderId);
         
        // Send Confirmation Email
        if (recipientEmail) {
            // ... (Simplified email logic or reuse helper)
             const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2D5F3F;">Payment Successful!</h2>
                    <p>Order <strong>${updatedOrder.order_number}</strong> has been confirmed.</p>
                </div>`;
             
             sendEmail({
                email: recipientEmail,
                subject: `Order Confirmed - ${updatedOrder.order_number}`,
                message: `Payment successful for order ${updatedOrder.order_number}.`,
                html: emailHtml
            }).catch(e => console.error("Email fail", e));
        }

        // Clear Cart
        if (order.user_id) {
            await Order.clearCart(order.user_id);
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });

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
                     -- Prefer customers table name; fall back to user's name, then user's email, then 'Guest' for display
                     COALESCE(NULLIF(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), ''), u.name, u.email, 'Guest') AS customer_name,
                     COALESCE(c.email, u.email, o.guest_email) AS customer_email
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
            createdAt: order.created_at,
            couponCode: order.coupon_code || null,
            discountAmount: order.discount_amount || 0
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
                   o.returned_at, o.refunded_at,
                   COALESCE(NULLIF(CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')), ''), NULLIF(u.name, ''), u.email) as display_name,
                   COALESCE(c.email, u.email) as display_email,
                   COALESCE(a.phone, c.phone, u.phone) as phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
            LEFT JOIN addresses a ON o.address_id = a.id
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
        const csvHeader = 'Order Number,Date,Customer Name,Email,Phone,Amount,Status,Returned At,Refunded At\n';
        const csvRows = rows.map(row => {
            const date = new Date(row.created_at).toLocaleDateString();
            const name = row.display_name || 'Guest';
            const returnedAt = row.returned_at ? new Date(row.returned_at).toLocaleDateString() : '';
            const refundedAt = row.refunded_at ? new Date(row.refunded_at).toLocaleDateString() : '';
            return `${row.order_number},${date},"${name}",${row.display_email || ''},${row.phone || ''},${row.total_amount},${row.status},${returnedAt},${refundedAt}`;
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
        const userEmail = req.user.email;
        const { page = 1, limit = 20, status } = req.query;
        const result = await Order.findAll({ page, limit, status, userId, userEmail });

        res.status(200).json({
            success: true,
            data: {
                orders: result.orders.map(order => ({
                    id: order.id,
                    orderNumber: order.order_number,
                    totalAmount: order.total_amount,
                    status: order.status,
                    createdAt: order.created_at,
                    items: (order.items || []).map(i => ({
                        product_id: i.product_id,
                        productName: i.product_name,
                        variantName: i.variant_name,
                        quantity: i.quantity,
                        image: i.image
                    }))
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

        // Check permissions:
        // 1. Admin can view all
        // 2. Owner can view theirs
        // 3. Guest can view (if req.user is undefined/null) IF they have the link (Public access by ID for now)
        // Note: For stricter security, we should verify a guest token or email, but for this stage, ID is sufficient.
        
        if (req.user) {
            if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
            }
        }
        // If req.user is missing (Guest), we allow them to view because they have the UUID.

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
            notes: order.notes, // Added Notes
            paymentStatus: order.payment_status,
            paymentMethod: order.payment_method, // Added
            // Items formatted for frontend compatibility
            items: order.items.map(item => ({
                id: item.product_id,
                name: item.product_name,
                productName: item.product_name, // Added alias for frontend
                variant: item.variant_name,
                variantName: item.variant_name, // Added alias
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                image: item.image
            })),
            // Also include a structured items array for newer clients
            itemsStructured: order.items.map(item => ({
                productId: item.product_id,
                productName: item.product_name,
                variantId: item.variant_id,
                variantName: item.variant_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                image: item.image
            })),
            address: order.address ? {
                fullName: order.address.full_name,
                phone: order.address.phone,
                addressLine1: order.address.address_line1,
                addressLine2: order.address.address_line2,
                city: order.address.city,
                state: order.address.state,
                postalCode: order.address.postal_code
            } : null,
            // Also provide a shippingAddress object compatible with frontend expectations
            shippingAddress: order.address ? {
                name: order.address.full_name,
                address: [order.address.address_line1, order.address.address_line2].filter(Boolean).join(', '),
                city: order.address.city,
                state: order.address.state,
                pincode: order.address.postal_code,
                phone: order.address.phone,
                pincode: order.address.postal_code,
                phone: order.address.phone,
                email: order.user_email || order.guest_email || null
            } : null,
            
            // Billing Address
            billingAddress: order.billingAddress ? {
                fullName: order.billingAddress.full_name,
                phone: order.billingAddress.phone,
                addressLine1: order.billingAddress.address_line1,
                addressLine2: order.billingAddress.address_line2,
                city: order.billingAddress.city,
                state: order.billingAddress.state,
                postalCode: order.billingAddress.postal_code
            } : null,
            // Summary (newer structured shape)
            summary: {
                subtotal: order.subtotal,
                discount: order.discount_amount,
                shipping: order.shipping_fee,
                tax: order.tax_amount,
                total: order.total_amount
            },
            // Backwards-compatible top-level numeric fields
            subtotal: order.subtotal,
            shipping: order.shipping_fee,
            tax: order.tax_amount,
            total: order.total_amount,
            totalAmount: order.total_amount, // Added for frontend
            couponCode: order.coupon_code, // Added coupon code validation field
            trackingNumber: order.tracking_number,
            carrier: order.carrier || 'Blue Dart', // Default to Blue Dart
            estimatedDeliveryDate: order.estimated_delivery_date || new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5)),
            createdAt: order.created_at,
            deliveredAt: order.delivered_at,
            timeline: timeline,
            tracking: order.tracking_number ? {
                carrier: order.carrier || 'Blue Dart',
                trackingNumber: order.tracking_number,
                estimatedDelivery: order.estimated_delivery_date || new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5))
            } : null
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
 * Download invoice PDF
 */
exports.downloadInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const filename = `invoice_${order.order_number || order.id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // --- Design Constants ---
        const primaryColor = '#2D5F3F'; // Brand Green
        const secondaryColor = '#8B6F47'; // Brand Brown/Gold
        const lightBg = '#F5F5F5';
        const darkText = '#333333';
        const lightText = '#666666';

        // --- Helper Functions ---
        const generateHr = (y) => {
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString();
        };

        // --- Header Section ---
        // Logo / Brand Name (Top Left)
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('SWADESHIKA', 50, 50);
        doc.fontSize(10).font('Helvetica').text('Authentic Indian Products', 50, 75);
        doc.fillColor(lightText).text('official.swadeshika@gmail.com', 50, 90);

        // Invoice Title & Details (Top Right)
        // Adjusted X to 300 and added width to ensure right alignment doesn't wrap prematurely
        const rightColX = 300;
        const rightColWidth = 245; // 545 (Right Margin) - 300
        
        doc.fillColor(darkText).fontSize(24).font('Helvetica-Bold').text('INVOICE', rightColX, 50, { width: rightColWidth, align: 'right' });
        doc.fontSize(10).font('Helvetica').text(`Invoice #: ${order.order_number || order.id.substring(0, 8)}`, rightColX, 80, { width: rightColWidth, align: 'right' });
        doc.text(`Date: ${formatDate(order.created_at)}`, rightColX, 95, { width: rightColWidth, align: 'right' });
        doc.text(`Status: ${order.status.toUpperCase()}`, rightColX, 110, { width: rightColWidth, align: 'right' });

        doc.moveDown();
        generateHr(130);

        // --- Addresses Section ---
        const customerTop = 150;
        
        // Billing Address (Left)
        let billingY = customerTop;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(darkText).text('Billing To:', 50, billingY);
        billingY += 15;
        doc.fontSize(10).font('Helvetica').fillColor(lightText);
        
        // Check if separate billing address exists and is different from shipping
        if (order.billingAddress && order.billing_address_id !== order.address_id) {
            // Separate billing address
            doc.text(order.billingAddress.full_name, 50, billingY, { width: 250 });
            doc.text(order.billingAddress.address_line1, 50, doc.y, { width: 250 });
            if (order.billingAddress.address_line2) doc.text(order.billingAddress.address_line2, 50, doc.y, { width: 250 });
            doc.text(`${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.postal_code}`, 50, doc.y, { width: 250 });
            doc.text(order.billingAddress.phone, 50, doc.y, { width: 250 });
        } else if (order.address) {
            // Same as shipping address
            doc.text('(Same as Shipping Address)', 50, billingY, { width: 250 });
        } else {
            // Fallback for guest orders
            doc.text(order.guest_email || 'Guest User', 50, billingY, { width: 250 });
        }
        
        const billingEndY = doc.y;

        // Shipping Address (Right)
        let shippingY = customerTop;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(darkText).text('Shipping To:', 350, shippingY);
        shippingY += 15;
        doc.fontSize(10).font('Helvetica').fillColor(lightText);
        
        if (order.address) {
            doc.text(order.address.full_name, 350, shippingY, { width: 200 }); // Start explicitly
            doc.text(order.address.address_line1, 350, doc.y, { width: 200 }); // Continue naturally
            if(order.address.address_line2) doc.text(order.address.address_line2, 350, doc.y, { width: 200 });
            doc.text(`${order.address.city}, ${order.address.state} - ${order.address.postal_code}`, 350, doc.y, { width: 200 });
            doc.text(order.address.phone, 350, doc.y, { width: 200 });
        } else {
            doc.text('Same as billing', 350, shippingY, { width: 200 });
        }

        const addressSectionBottom = Math.max(billingEndY, doc.y);
        generateHr(addressSectionBottom + 20);

        // --- Items Table ---
        const tableTop = addressSectionBottom + 40;
        const itemCodeX = 50;
        const descriptionX = 100;
        const quantityX = 340; // Shifted left
        const priceX = 390;    // Shifted left
        const totalX = 480;    // Shifted left allowing more space for totals

        // Table Headers
        doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor);
        doc.text('#', itemCodeX, tableTop);
        doc.text('Item Description', descriptionX, tableTop);
        doc.text('Qty', quantityX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop, { align: 'right', width: 65 }); // Align header right to match values
        
        generateHr(tableTop + 15);

        // Table Rows
        let yPromise = tableTop + 30;
        doc.font('Helvetica').fontSize(10).fillColor(darkText);

        order.items.forEach((item, i) => {
            const name = item.product_name || item.productName || 'Item';
            const variant = item.variant_name ? `(${item.variant_name})` : '';
            const qty = item.quantity || 1;
            const price = Number(item.price || 0).toFixed(2);
            const lineTotal = Number(item.subtotal || (item.price * item.quantity) || 0).toFixed(2);

            doc.text(i + 1, itemCodeX, yPromise);
            doc.text(`${name} ${variant}`, descriptionX, yPromise, { width: 230 });
            doc.text(qty, quantityX, yPromise);
            doc.text(`Rs. ${price}`, priceX, yPromise);
            doc.text(`Rs. ${lineTotal}`, totalX, yPromise, { align: 'right', width: 65 });
            
            yPromise += 20; 
        });

        generateHr(yPromise + 10);

        // --- Totals Section ---
        const totalSectionTop = yPromise + 25;
        
        // Define columns for Totals (Right Aligned)
        const labelsStart = 300;
        const labelsWidth = 140; // Ends at 440
        const valuesStart = 450;
        const valuesWidth = 95;  // Ends at 545

        doc.font('Helvetica').fontSize(10).fillColor(lightText);
        
        doc.text('Subtotal:', labelsStart, totalSectionTop, { width: labelsWidth, align: 'right' });
        doc.text(`Rs. ${Number(order.subtotal || 0).toFixed(2)}`, valuesStart, totalSectionTop, { width: valuesWidth, align: 'right' });

        doc.text('Shipping:', labelsStart, totalSectionTop + 15, { width: labelsWidth, align: 'right' });
        doc.text(`Rs. ${Number(order.shipping_fee || 0).toFixed(2)}`, valuesStart, totalSectionTop + 15, { width: valuesWidth, align: 'right' });

        doc.text('Tax (GST):', labelsStart, totalSectionTop + 30, { width: labelsWidth, align: 'right' });
        doc.text(`Rs. ${Number(order.tax_amount || 0).toFixed(2)}`, valuesStart, totalSectionTop + 30, { width: valuesWidth, align: 'right' });

        // Grand Total
        generateHr(totalSectionTop + 45);
        doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor);
        doc.text('Grand Total:', labelsStart, totalSectionTop + 55, { width: labelsWidth, align: 'right' });
        doc.text(`Rs. ${Number(order.total_amount || 0).toFixed(2)}`, valuesStart, totalSectionTop + 55, { width: valuesWidth, align: 'right' });

        // --- Footer ---
        doc.fontSize(10).font('Helvetica').fillColor(lightText);
        doc.text('Thank you for shopping with Swadeshika!', 50, 700, { align: 'center', width: 500 });
        doc.fontSize(8).text('This is a computer-generated invoice.', 50, 715, { align: 'center', width: 500 });
        
        doc.end();
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
        const { status, trackingNumber, carrier } = req.body;

        const success = await Order.updateStatus(req.params.id, status, trackingNumber, carrier);

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
        const { orderId } = req.body;

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

        // Security Check: Verify Email - REMOVED as per request to allow tracking by ID only
        // const orderEmail = order.user_email || order.guest_email;
        // if (!orderEmail || orderEmail.toLowerCase() !== email.toLowerCase()) {
        //      return res.status(404).json({ success: false, message: 'Order details do not match.' });
        // }

        // Construct timeline based on status
        const timeline = [
            { status: 'placed', label: 'Order Placed', date: order.created_at, completed: true },
            { status: 'confirmed', label: 'Order Confirmed', date: order.created_at, completed: true },
            { status: 'processing', label: 'Processing', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
            { status: 'shipped', label: 'Shipped', date: order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
            { status: 'delivered', label: 'Delivered', date: order.delivered_at, completed: order.status === 'delivered' }
        ];

        // Format response
        res.status(200).json({
            success: true,
            data: {
                orderId: order.order_number,
                status: order.status,
                totalAmount: order.total_amount,
                trackingNumber: order.tracking_number,
                carrier: order.carrier || 'Blue Dart',
                estimatedDelivery: order.estimated_delivery_date || new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5)),
                currentLocation: order.status === 'delivered' ? 'Delivered' : 'In Transit',
                timeline,
                items: order.items.map(item => ({
                     name: item.product_name,
                     variantName: item.variant_name,
                     quantity: item.quantity,
                     image: item.image
                }))
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

        // Allow cancellation for pending, placed, or confirmed orders
        // (Before processing/shipping)
        const cancellableStatuses = ['pending', 'placed', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
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
