const express = require('express');
const router = express.Router();
const BlogCategoryController = require('../controllers/blogCategoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

// Validation rules
const categoryValidation = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
    body('description').optional().trim(),
    body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a positive number'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

// Public route - Get active categories
router.get('/active', BlogCategoryController.getActiveCategories);
// Public route - Get all categories (for debugging visibility issues)
// router.get('/all', BlogCategoryController.getAllCategories);

// Admin routes - CRUD operations
router.get('/', authenticate, authorize('admin'), BlogCategoryController.getAllCategories);
router.get('/:id', authenticate, authorize('admin'), BlogCategoryController.getCategory);
router.post('/', authenticate, authorize('admin'), categoryValidation, validate, BlogCategoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryValidation, validate, BlogCategoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), BlogCategoryController.deleteCategory);

module.exports = router;
