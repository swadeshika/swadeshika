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
