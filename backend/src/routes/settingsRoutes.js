const express = require('express');
const router = express.Router();
const AdminSettingsController = require('../controllers/adminSettingsController');

/**
 * GET /
 * Fetch site settings (Public)
 * Used for shipping calculations, site name, support info, etc.
 */
router.get('/', AdminSettingsController.getSettings);

module.exports = router;
