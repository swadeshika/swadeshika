const AnalyticsModel = require('../models/analyticsModel');

/**
 * AnalyticsController
 * Handles visitor tracking and analytics data retrieval.
 */

/**
 * Track a visitor
 * Records IP, User-Agent, and Path. Increments visitor count.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.trackVisitor = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const path = req.body.path || '/';

        const count = await AnalyticsModel.incrementVisitorCount(ip, userAgent, path);

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get total visitor count
 * Returns the current count of unique visitors/visits.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getVisitorCount = async (req, res, next) => {
    try {
        const count = await AnalyticsModel.getVisitorCount();
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

/**
     * Get Admin Analytics Data (Charts)
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
exports.getAdminAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate, metric, interval } = req.query;
        // In a real implementation, call AnalyticsService or OrderService to aggregate data
        // For now, returning mock data to satisfy the frontend/docs contract

        const mockData = {
            labels: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5", "Jan 6", "Jan 7"],
            datasets: [
                {
                    label: metric || "Revenue",
                    data: [1200, 1500, 1100, 1800, 2000, 1700, 2200],
                    borderColor: "#4F46E5",
                    tension: 0.4
                }
            ]
        };

        res.status(200).json({
            success: true,
            data: mockData
        });
    } catch (error) {
        next(error);
    }
};
