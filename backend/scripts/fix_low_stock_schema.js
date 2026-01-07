const db = require('../src/config/db');

async function fixLowStockSchema() {
    try {
        console.log("Fixing Low Stock Schema...");

        // 1. Modify column to allow NULL and default to NULL
        console.log("Modifying products.low_stock_threshold to be nullable...");
        await db.query(`ALTER TABLE products MODIFY COLUMN low_stock_threshold INT NULL DEFAULT NULL`);

        // 2. Set existing default values (e.g. 10) to NULL to enable inheritance
        console.log("Resetting existing default '10' values to NULL...");
        await db.query(`UPDATE products SET low_stock_threshold = NULL WHERE low_stock_threshold = 10`);

        console.log("✅ Schema updated for Low Stock Logic.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing low stock schema:", error);
        process.exit(1);
    }
}

fixLowStockSchema();
