const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Admin Routes
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

module.exports = router;
