const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * User Routes
 * Base URL: /api/v1/users
 */

// Validation Rules
const updateUserValidation = [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
];

// Public/Protected Routes
/**
 * @route GET /profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, UserController.getProfile);

/**
 * @route PUT /profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticate, updateUserValidation, validate, UserController.updateProfile);

// Admin Routes
/**
 * @route GET /
 * @desc Get all users
 * @access Admin
 */
router.get('/', authenticate, authorize('admin'), UserController.getAllUsers);

/**
 * @route GET /:id
 * @desc Get user by ID
 * @access Admin
 */
router.get('/:id', authenticate, authorize('admin'), UserController.getUserById);

/**
 * @route DELETE /:id
 * @desc Delete user
 * @access Admin
 */
router.delete('/:id', authenticate, authorize('admin'), UserController.deleteUser);

module.exports = router;
