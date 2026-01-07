const db = require('../src/config/db');

async function checkSettings() {
    try {
        console.log("Fetching Admin Settings...");
        const [rows] = await db.query('SELECT * FROM admin_settings LIMIT 1');
        console.log("Settings:", rows[0]);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fetching settings:", error);
        process.exit(1);
    }
}

checkSettings();
