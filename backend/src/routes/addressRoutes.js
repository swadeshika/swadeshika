const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AddressController = require('../controllers/addressController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Address Routes
 * Base URL: /api/v1/users/addresses
 */

// Validation rules
const addressValidation = [
    body('name').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('addressLine1').notEmpty().withMessage('Address Line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postalCode').notEmpty().withMessage('Postal code is required'),
    body('addressType').optional().isIn(['home', 'work', 'other']).withMessage('Invalid address type')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
/**
 * @route GET /
 * @desc Get all addresses for the logged-in user
 * @access Private
 */
router.get('/', AddressController.getAddresses);

/**
 * @route POST /
 * @desc Create a new address
 * @access Private
 */
router.post('/', addressValidation, validate, AddressController.createAddress);

/**
 * @route PUT/:id
 * @desc Update an existing address
 * @access Private
 */
router.put('/:id', addressValidation, validate, AddressController.updateAddress);

/**
 * @route DELETE /:id
 * @desc Delete an address
 * @access Private
 */
router.delete('/:id', AddressController.deleteAddress);

module.exports = router;
