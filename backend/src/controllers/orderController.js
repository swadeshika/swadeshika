const Order = require('../models/orderModel');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, paymentMethod, couponCode, notes } = req.body;

        // 1. Get items from cart
        const cartItems = await Order.getCartItems(userId);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 2. Calculate totals
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

        // 3. Create Order
        const orderData = {
            user_id: userId,
            address_id: addressId,
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

        // 4. Clear Cart
        await Order.clearCart(userId);

        // 5. Format Response
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
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        // Admin can see all orders
        const result = await Order.findAll({ page, limit, status });

        res.status(200).json({
            success: true,
            data: {
                orders: result.orders.map(order => ({
                    id: order.id,
                    orderNumber: order.order_number,
                    user: { id: order.user_id }, // Could fetch user details if needed
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
        console.error('Get All Orders Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
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
        console.error('Get My Orders Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
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
        console.error('Get Order By ID Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
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
        console.error('Update Order Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
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
        console.error('Cancel Order Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
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
        console.error('Delete Order Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
