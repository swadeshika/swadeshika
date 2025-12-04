const db = require('../config/db');

class AdminSettingsModel {
  /**
   * Get all admin settings
   * ----------------------
   * Returns a single row containing all settings fields.
   * Uses explicit column selection to avoid SELECT *.
   */
  static async getSettings() {
    const query = `
      SELECT 
        id, 
        store_name, 
        support_email, 
        support_phone, 
        store_address, 
        logo_data_url, 
        guest_checkout, 
        default_order_status, 
        currency, 
        shipping_method, 
        free_shipping_threshold, 
        flat_rate, 
        gst_percent, 
        prices_include_tax, 
        ga_id, 
        search_console_id, 
        timezone, 
        units, 
        low_stock_threshold, 
        allow_backorders, 
        two_factor_enabled, 
        updated_at
      FROM admin_settings
      LIMIT 1
    `;

    const [rows] = await db.query(query);
    return rows[0] || null;
  }

  /**
   * Update admin settings
   * ---------------------
   * Updates the singleton settings row (ID 1).
   * Dynamically builds the query to only update provided fields.
   */
  static async update(data) {
    // Allowed fields for update
    const allowedFields = [
      'store_name',
      'support_email',
      'support_phone',
      'store_address',
      'logo_data_url',
      'guest_checkout',
      'default_order_status',
      'currency',
      'shipping_method',
      'free_shipping_threshold',
      'flat_rate',
      'gst_percent',
      'prices_include_tax',
      'ga_id',
      'search_console_id',
      'timezone',
      'units',
      'low_stock_threshold',
      'allow_backorders',
      'two_factor_enabled'
    ];

    // 1. Check if settings exist
    const existing = await this.getSettings();

    const fields = [];
    const values = [];

    if (existing) {
      // --- UPDATE PATH ---
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(data[field]);
        }
      }

      if (fields.length === 0) return existing;

      fields.push('updated_at = NOW()');

      const query = `UPDATE admin_settings SET ${fields.join(', ')} WHERE id = 1`;
      await db.query(query, values);

    } else {
      // --- INSERT PATH ---
      // Force ID = 1
      const insertFields = ['id'];
      const insertValues = [1];
      const placeholders = ['?'];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          insertFields.push(field);
          insertValues.push(data[field]);
          placeholders.push('?');
        }
      }

      const query = `
        INSERT INTO admin_settings (${insertFields.join(', ')}, updated_at)
        VALUES (${placeholders.join(', ')}, NOW())
      `;
      await db.query(query, insertValues);
    }

    return this.getSettings();
  }
}

module.exports = AdminSettingsModel;
