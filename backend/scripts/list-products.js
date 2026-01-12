const db = require('../src/config/db');

async function listProducts() {
    try {
        console.log("Fetching Products List...");
        const [rows] = await db.query('SELECT id, name FROM products LIMIT 20');
        console.log("Current Products in DB:", rows);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        process.exit(1);
    }
}

listProducts();
