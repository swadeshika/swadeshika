const db = require('../src/config/db');

async function checkCategories() {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        console.log('Categories found:', rows.length);
        if (rows.length > 0) {
            console.table(rows);
        } else {
            console.log('No categories found. Please insert some categories first.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkCategories();
