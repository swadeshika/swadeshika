const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../constants/roles');

/**
 * PUBLIC ROUTES
 */
// POST /api/v1/contact - Submit contact form
router.post('/', contactController.submitContactForm);

/**
 * PROTECTED ROUTES (Admin only)
 */
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// GET /api/v1/contact - List all submissions
router.get('/', contactController.getAllSubmissions);

// GET /api/v1/contact/:id - Get single submission
router.get('/:id', contactController.getSubmissionById);

// PUT /api/v1/contact/:id - Update status
router.put('/:id', contactController.updateSubmissionStatus);

// POST /api/v1/contact/:id/reply - Reply to submission
router.post('/:id/reply', contactController.replyToSubmission);

// DELETE /api/v1/contact/:id - Archive submission
router.delete('/:id', contactController.deleteSubmission);

module.exports = router;
