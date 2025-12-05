const db = require('../src/config/db');

/**
 * Script: update_settings_schema.js
 * Purpose: Updates the admin_settings table to include enabled_gateways and gateway_configs columns.
 */

/**
 * Update the database schema
 */
async function updateSchema() {
  try {
    console.log('Adding gateway columns to admin_settings table...');
    
    // Check if columns exist first (to avoid errors if run multiple times)
    // But simpler to just try adding them and ignore "duplicate column" error or use IF NOT EXISTS syntax if supported (MySQL 8.0+ supports ADD COLUMN IF NOT EXISTS, but older might not)
    // We'll just try to add them.
    
    const query1 = `
      ALTER TABLE admin_settings
      ADD COLUMN enabled_gateways JSON,
      ADD COLUMN gateway_configs JSON;
    `;
    
    await db.query(query1);
    console.log('Successfully added enabled_gateways and gateway_configs columns.');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist. Skipping.');
    } else {
      console.error('Error updating schema:', error);
    }
  } finally {
    process.exit();
  }
}

updateSchema();
