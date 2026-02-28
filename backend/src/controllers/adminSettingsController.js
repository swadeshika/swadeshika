const AdminSettingsService = require('../services/adminSettingsService');
const { getMessage } = require('../constants/messages');

/**
 * adminSettingsController.js
 * --------------------------
 * Handles global application settings managed by admins.
 * 
 * Operations:
 * 1. Get Settings
 * 2. Update Settings
 */
class AdminSettingsController {
    /**
     * Get Settings API
     * ----------------
     * Method: GET
     * Path: /api/v1/settings
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getSettings(req, res, next) {
        try {
            const settings = await AdminSettingsService.getSettings();

            if (!settings) {
                return res.status(404).json({
                    success: false,
                    message: 'Settings not found',
                });
            }

            // --- SECURITY FIX: Mask sensitive keys for public requests ---
            // If the user is not an admin, we MUST remove sensitive credentials
            const isAdmin = req.user && req.user.role === 'admin';
            
            if (!isAdmin) {
                // Remove internal gateway configurations (keys, secrets)
                delete settings.gateway_configs;
                
                // You can also mask other sensitive fields likega_id if you want, 
                // but gateway_configs is the most critical.
                
                // For enabled_gateways, we only want to show WHICH ones are active, 
                // not their internal details (though usually it's just true/false).
            }

            return res.status(200).json({
                success: true,
                data: settings,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Update Settings API
     * -------------------
     * Method: PUT
     * Path: /api/v1/admin/settings
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async updateSettings(req, res, next) {
        try {
            const data = req.body;

            // --- Validation Start ---

            // 1. Email Format
            if (data.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.support_email)) {
                return res.status(400).json({ success: false, message: 'Invalid support email format' });
            }

            // 2. Numeric Checks
            if (data.gst_percent && isNaN(data.gst_percent)) {
                return res.status(400).json({ success: false, message: 'GST Percent must be a number' });
            }
            if (data.flat_rate && isNaN(data.flat_rate)) {
                return res.status(400).json({ success: false, message: 'Flat Rate must be a number' });
            }
            if (data.free_shipping_threshold && isNaN(data.free_shipping_threshold)) {
                return res.status(400).json({ success: false, message: 'Free Shipping Threshold must be a number' });
            }

            // 3. Enum Checks
            const validCurrencies = ['inr', 'usd'];
            if (data.currency && !validCurrencies.includes(data.currency)) {
                return res.status(400).json({ success: false, message: 'Invalid currency. Allowed: inr, usd' });
            }

            const validTimezones = ['asia-kolkata', 'utc'];
            if (data.timezone && !validTimezones.includes(data.timezone)) {
                return res.status(400).json({ success: false, message: 'Invalid timezone. Allowed: asia-kolkata, utc' });
            }

            const validOrderStatuses = ['pending', 'confirmed', 'processing'];
            if (data.default_order_status && !validOrderStatuses.includes(data.default_order_status)) {
                return res.status(400).json({ success: false, message: 'Invalid default order status' });
            }
            // --- Validation End ---

            const updatedSettings = await AdminSettingsService.updateSettings(data);

            return res.status(200).json({
                success: true,
                message: 'Settings updated successfully',
                data: updatedSettings,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AdminSettingsController;
