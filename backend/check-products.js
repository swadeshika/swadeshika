
const db = require('./src/config/db');

async function checkProducts() {
    try {
        console.log("Checking products table...");
        const [rows] = await db.query('SELECT id, name FROM products LIMIT 10');
        console.log("Found products:", rows);
        process.exit(0);
    } catch (error) {
        console.error("Error checking products:", error);
        process.exit(1);
    }
}

checkProducts();
