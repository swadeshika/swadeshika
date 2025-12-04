const express = require('express');
const router = express.Router();
const AdminSettingsController = require('../controllers/adminSettingsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * GET /
 * Fetch all admin settings
 * Protected: Admin only
 */
router.get(
    '/',
    authenticate,
    authorize('admin'),
    AdminSettingsController.getSettings
);

/**
 * PUT /
 * Update admin settings
 * Protected: Admin only
 */
router.put(
    '/',
    authenticate,
    authorize('admin'),
    AdminSettingsController.updateSettings
);

module.exports = router;
