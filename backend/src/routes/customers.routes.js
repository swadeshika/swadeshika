// src/routes/customers.routes.js
const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');

// Create new customer
router.post('/', customersController.createCustomer);

// Get all customers (pagination, search, filter)
router.get('/', customersController.getAllCustomers);

// Get specific customer
router.get('/:id', customersController.getCustomerById);

// Update customer
router.put('/:id', customersController.updateCustomer);

// Delete customer (Soft delete)
router.delete('/:id', customersController.deleteCustomer);

module.exports = router;
