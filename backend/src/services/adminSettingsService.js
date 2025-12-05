const AdminSettingsModel = require('../models/adminSettingsModel');

class AdminSettingsService {
    /**
     * Fetch admin settings
     * --------------------
     * Calls the model to get settings data.
     */
    static async getSettings() {
        return await AdminSettingsModel.getSettings();
    }

    /**
     * Update admin settings
     * ---------------------
     * Calls the model to update settings data.
     */
    static async updateSettings(data) {
        return await AdminSettingsModel.update(data);
    }
}

module.exports = AdminSettingsService;
