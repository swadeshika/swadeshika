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
        enabled_gateways,
        gateway_configs,
        updated_at
      FROM admin_settings
      LIMIT 1
    `;

    const [rows] = await db.query(query);

    if (rows.length === 0) {
      // Bootstrap with default values
      await db.query('INSERT INTO admin_settings (id, store_name, updated_at) VALUES (1, "Swadeshika Store", NOW())');
      const [newRows] = await db.query(query);
      return newRows[0];
    }

    const settings = rows[0];

    // Parse JSON fields if they are strings (mysql2 might return them as objects or strings depending on config)
    if (settings) {
      if (typeof settings.enabled_gateways === 'string') {
        try { settings.enabled_gateways = JSON.parse(settings.enabled_gateways); } catch (e) { settings.enabled_gateways = {}; }
      }
      if (typeof settings.gateway_configs === 'string') {
        try { settings.gateway_configs = JSON.parse(settings.gateway_configs); } catch (e) { settings.gateway_configs = {}; }
      }
    }

    return settings;
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
      'two_factor_enabled',
      'enabled_gateways',
      'gateway_configs'
    ];

    // 1. Get existing settings to find the correct ID
    // WHY? We cannot assume ID=1 because auto-increment might have skipped it or user might have deleted/re-created rows.
    const existing = await this.getSettings();

    // If no settings exist, create them with ID 1
    if (!existing) {
      const insertFields = ['id'];
      const insertValues = [1];
      const placeholders = ['?'];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          insertFields.push(field);
          let value = data[field];
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          insertValues.push(value);
          placeholders.push('?');
        }
      }

      const query = `
        INSERT INTO admin_settings (${insertFields.join(', ')}, updated_at)
        VALUES (${placeholders.join(', ')}, NOW())
      `;
      await db.query(query, insertValues);
      return this.getSettings();
    }

    // 2. Update the EXISTING row (whatever its ID is)
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        let value = data[field];
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = NOW()');

    // Add ID to values array for WHERE clause
    // This ensures we update the ACTUAL row found in step 1, not just "ID=1"
    values.push(existing.id);

    const query = `
      UPDATE admin_settings
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await db.query(query, values);
    return this.getSettings(); // Return updated settings
  }
}

module.exports = AdminSettingsModel;
