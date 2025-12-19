const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.post('/', ContactController.submitContactForm);

// Admin
router.get('/', authenticate, authorize('admin'), ContactController.getAllSubmissions);
router.get('/:id', authenticate, authorize('admin'), ContactController.getSubmissionById);
router.put('/:id', authenticate, authorize('admin'), ContactController.updateSubmissionStatus);
router.delete('/:id', authenticate, authorize('admin'), ContactController.deleteSubmission);

module.exports = router;
