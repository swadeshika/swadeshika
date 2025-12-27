// src/routes/customers.routes.js
const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// All routes are admin only
router.use(authenticate, authorize('admin'));

// Create new customer
router.post('/', customersController.createCustomer);

// Get all customers (pagination, search, filter)
router.get('/', customersController.getAllCustomers);

// Get specific customer
router.get('/:id', customersController.getCustomerById);

// Update customer
router.put('/:id', customersController.updateCustomer);

// Delete customer (Soft delete - Note: Ensure DB column exists or update migration)
router.delete('/:id', customersController.deleteCustomer);

module.exports = router;
