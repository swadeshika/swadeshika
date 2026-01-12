const db = require('../src/config/db');

async function fixSettingsTable() {
    try {
        console.log("Fixing admin_settings table...");

        // Check if columns exist
        const [columns] = await db.query(`SHOW COLUMNS FROM admin_settings LIKE 'enabled_gateways'`);

        if (columns.length === 0) {
            console.log("Adding enabled_gateways column...");
            await db.query(`ALTER TABLE admin_settings ADD COLUMN enabled_gateways JSON`);
        } else {
            console.log("enabled_gateways column already exists.");
        }

        const [columns2] = await db.query(`SHOW COLUMNS FROM admin_settings LIKE 'gateway_configs'`);
        if (columns2.length === 0) {
            console.log("Adding gateway_configs column...");
            await db.query(`ALTER TABLE admin_settings ADD COLUMN gateway_configs JSON`);
        } else {
            console.log("gateway_configs column already exists.");
        }

        console.log("✅ admin_settings table updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating table:", error);
        process.exit(1);
    }
}

fixSettingsTable();
