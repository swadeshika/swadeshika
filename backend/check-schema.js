
const db = require('./src/config/db');

async function checkSchema() {
    try {
        console.log("Checking products schema...");
        const [rows] = await db.query('DESCRIBE products');
        console.log("Products Columns:", rows.map(r => r.Field).join(', '));
        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
}

checkSchema();
