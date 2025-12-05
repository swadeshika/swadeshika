const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

// Validation Rules
const categoryValidation = [
    body('name').notEmpty().withMessage('Category name is required'),
    body('parent_id').optional().custom((value) => {
        if (value !== null && !Number.isInteger(value)) {
            throw new Error('Parent ID must be an integer or null');
        }
        return true;
    }),
    body('display_order').optional().isInt().withMessage('Display order must be an integer')
];

// Public Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Admin Routes (Protected)
router.post('/', authenticate, authorize('admin'), categoryValidation, validate, categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryValidation, validate, categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
