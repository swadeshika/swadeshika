const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function debug() {
    try {
        console.log("--- SETTINGS (Threshold) ---");
        const [settings] = await db.query('SELECT free_shipping_threshold, flat_rate FROM admin_settings');
        console.log(settings[0]);

        console.log("\n--- LAST ORDER (Subtotal/Shipping) ---");
        const [orders] = await db.query('SELECT subtotal, shipping_fee FROM orders ORDER BY created_at DESC LIMIT 1');
        if (orders.length > 0) {
            console.log(orders[0]);
        } else {
            console.log("No orders found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
