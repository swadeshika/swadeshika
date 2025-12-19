const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// All routes are admin only
router.use(authenticate, authorize('admin'));

// Create request for new report
router.post('/', ReportController.generateReport);

// List all reports
router.get('/', ReportController.getReports);

// Download report
router.get('/:id/download', ReportController.downloadReport);

// Delete report
router.delete('/:id', ReportController.deleteReport);

module.exports = router;
