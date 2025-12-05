const DashboardService = require('../services/dashboardService');

/**
 * DashboardController
 * Handles admin dashboard data and reports.
 */
class DashboardController {
    /**
     * Get reports data (sales, orders, etc.)
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getReports(req, res, next) {
        try {
            const { range } = req.query;
            const data = await DashboardService.getStats(range);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get dashboard overview stats
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getDashboardOverview(req, res, next) {
        try {
            const data = await DashboardService.getDashboardOverview();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DashboardController;
