const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getAllOrders,
    getMyOrders,
    getOrderById,
    downloadInvoice,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    exportOrders,
    trackOrder
} = require('../controllers/orderController');
const { authenticate, authorize, optionalAuthenticate } = require('../middlewares/authMiddleware');

/**
 * CRITICAL FIX: Input Validation for Orders
 * ==========================================
 * 
 * WHAT CHANGED:
 * - Added comprehensive order validation
 * - Validates items array, addresses, amounts
 * - Prevents empty orders and invalid totals
 * 
 * WHY THIS MATTERS:
 * - Prevents order total manipulation
 * - Ensures all required fields are present
 * - Validates shipping address completeness
 */
const orderValidator = require('../validators/orderValidator');

// Routes
// Public Routes
router.post('/track', trackOrder);

// Protected Routes (User)
// Allow optional authentication for checkout so guest users can place orders.
router.post('/', optionalAuthenticate, orderValidator.create, createOrder);
router.post('/verify-payment', optionalAuthenticate, verifyPayment);
// Download invoice PDF
router.get('/:id/invoice', optionalAuthenticate, orderValidator.getById, downloadInvoice);
router.get('/', authenticate, getMyOrders);
router.get('/:id', optionalAuthenticate, orderValidator.getById, getOrderById); // Controller handles permission check for owner/admin
router.post('/:id/cancel', authenticate, orderValidator.cancel, cancelOrder);

// Admin Routes
router.get('/admin/export', authenticate, authorize('admin'), exportOrders);
router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

module.exports = router;
