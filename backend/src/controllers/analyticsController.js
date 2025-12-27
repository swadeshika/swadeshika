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
        const ip = req.ip || (req.socket ? req.socket.remoteAddress : (req.connection ? req.connection.remoteAddress : '127.0.0.1'));
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
        const { startDate, endDate, metric, range = 7 } = req.query;
        
        // Fetch real data from DB
        const stats = await AnalyticsModel.getDailyRevenue(parseInt(range));

        const labels = stats.map(s => {
            const date = new Date(s.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = stats.map(s => s.revenue);

        // If no data, provide empty but valid structure
        const finalData = {
            labels: labels.length > 0 ? labels : ["No Data"],
            datasets: [
                {
                    label: metric || "Revenue",
                    data: data.length > 0 ? data : [0],
                    borderColor: "#4F46E5",
                    tension: 0.4
                }
            ]
        };

        res.status(200).json({
            success: true,
            data: finalData
        });
    } catch (error) {
        next(error);
    }
};
