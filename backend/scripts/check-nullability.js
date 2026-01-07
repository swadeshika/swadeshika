const db = require('../src/config/db');

async function checkNullability() {
    try {
        console.log("Checking columns...");
        const [rows] = await db.query(`
            SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'swadeshikaa' 
            AND COLUMN_NAME = 'user_id' 
            AND TABLE_NAME IN ('addresses', 'orders')
        `);
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkNullability();
