// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * CRITICAL FIX: Input Validation
 * ===============================
 * 
 * WHAT CHANGED:
 * - Replaced basic inline validation with comprehensive validator
 * - Added validation for all product fields
 * - Returns detailed 422 errors
 * 
 * WHY THIS MATTERS:
 * - Prevents invalid data (negative prices, invalid stock)
 * - Catches errors before database operations
 * - Provides clear error messages to frontend
 */
const productValidator = require('../validators/productValidator');

// Public Routes
router.get('/', productController.getAllProducts);
/**
 * GET /products/:id
 * =================
 * 
 * IMPORTANT: No validator here!
 * - This route accepts BOTH numeric IDs and string slugs
 * - Examples: /products/123 OR /products/pure-desi-cow-ghee
 * - The controller and model handle both cases via findByIdOrSlug()
 * - Adding isInt() validator would reject all slug-based requests
 */
router.get('/:id', productController.getProduct);

// Admin Routes (Protected)
router.post('/', authenticate, authorize('admin'), productValidator.create, productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), productValidator.update, productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productValidator.delete, productController.deleteProduct);

module.exports = router;
