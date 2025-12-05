const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.post('/', ContactController.submitContactForm);

// Admin
router.get('/', authenticate, authorize('admin'), ContactController.getAllSubmissions);

module.exports = router;
