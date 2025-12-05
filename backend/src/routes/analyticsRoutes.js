const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Public - Track visit (usually called by frontend on load)
router.post('/visitors/track', AnalyticsController.trackVisitor);

// Public - Get count (for footer display)
router.get('/visitors/count', AnalyticsController.getVisitorCount);

module.exports = router;
