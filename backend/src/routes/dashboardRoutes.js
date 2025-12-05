const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// All routes are admin only
router.use(authenticate, authorize('admin'));

router.get('/overview', DashboardController.getDashboardOverview);
router.get('/reports', DashboardController.getReports);

module.exports = router;
