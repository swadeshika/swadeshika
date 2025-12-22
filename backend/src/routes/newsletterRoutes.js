const express = require('express');
const router = express.Router();
const NewsletterController = require('../controllers/newsletterController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.post('/subscribe', NewsletterController.subscribe);

// Admin
router.get('/', authenticate, authorize('admin'), NewsletterController.getAllSubscribers);
router.delete('/:id', authenticate, authorize('admin'), NewsletterController.deleteSubscriber);

module.exports = router;
