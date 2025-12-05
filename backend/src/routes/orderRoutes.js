const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    getOrderById,
    cancelOrder,
    trackOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Routes
// Public Routes
router.post('/track', trackOrder);

// Protected Routes
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

module.exports = router;
