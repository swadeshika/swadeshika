// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin Routes (Protected)
router.post('/', authenticate, authorize('admin'), productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
