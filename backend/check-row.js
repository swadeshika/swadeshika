
const db = require('./src/config/db');

async function checkRow() {
    try {
        const [rows] = await db.query('SELECT * FROM products LIMIT 1');
        if (rows.length > 0) {
            console.log("KEYS:", Object.keys(rows[0]).join(', '));
        } else {
            console.log("No products found to infer schema.");
            // Fallback: Describe
            const [cols] = await db.query('SHOW COLUMNS FROM products');
            console.log("COLUMNS:", cols.map(c => c.Field).join(', '));
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkRow();
