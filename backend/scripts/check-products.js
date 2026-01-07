const db = require('../src/config/db');

async function checkProducts() {
    try {
        console.log("--- PRODUCTS LIST ---");
        const [rows] = await db.query('SELECT id, name, sku FROM products');
        console.table(rows);

        console.log("--- DB CART ITEMS ---");
        const [cartRows] = await db.query('SELECT * FROM cart_items');
        console.table(cartRows);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkProducts();
