require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function checkLastOrder() {
    try {
        const [rows] = await db.query('SELECT id, order_number, subtotal, shipping_fee, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 1');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log('No orders found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkLastOrder();
