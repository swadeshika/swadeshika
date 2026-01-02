
const db = require('./src/config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM products');
        console.log("COLUMNS:", rows.map(r => r.Field).join(', '));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkSchema();
