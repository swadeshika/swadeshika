const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function checkSettings() {
    try {
        const [rows] = await db.query('SELECT * FROM admin_settings LIMIT 1');
        if (rows.length > 0) {
            console.log('Current Settings:', rows[0]);
        } else {
            console.log('No settings found in DB. Using defaults.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSettings();
