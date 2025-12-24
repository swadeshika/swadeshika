// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

// Validation Rules
const productValidation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category_id').optional({ nullable: true }).isInt().withMessage('Category ID must be an integer'),
    body('stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin Routes (Protected)
router.post('/', authenticate, authorize('admin'), productValidation, validate, productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), productValidation, validate, productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
