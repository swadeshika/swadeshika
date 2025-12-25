const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    exportOrders
} = require('../controllers/orderController');
const { authenticate, authorize, optionalAuthenticate } = require('../middlewares/authMiddleware');

// Routes
// Public Routes
// router.post('/track', trackOrder);


// Protected Routes (User)
// Allow optional authentication for checkout so guest users can place orders.
router.post('/', optionalAuthenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById); // Controller handles permission check for owner/admin
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin Routes
router.get('/admin/export', authenticate, authorize('admin'), exportOrders);
router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

module.exports = router;
