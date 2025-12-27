const db = require('./src/config/db');

(async () => {
    await db.connectDB();
    
    // Get products with all relevant fields
    const [rows] = await db.query(`
        SELECT 
            id, 
            name, 
            in_stock,
            stock_quantity,
            is_active,
            CASE 
                WHEN in_stock = 1 THEN 'TRUE'
                WHEN in_stock = 0 THEN 'FALSE'
                ELSE 'NULL'
            END as in_stock_status
        FROM products
    `);
    
    console.log('=== PRODUCTS DATA ===');
    rows.forEach(row => {
        console.log(`\nProduct: ${row.name}`);
        console.log(`  ID: ${row.id}`);
        console.log(`  in_stock (raw): ${row.in_stock} (type: ${typeof row.in_stock})`);
        console.log(`  in_stock_status: ${row.in_stock_status}`);
        console.log(`  stock_quantity: ${row.stock_quantity}`);
        console.log(`  is_active: ${row.is_active}`);
        console.log(`  Should be Active: ${row.in_stock === 1 && row.stock_quantity > 0}`);
    });
    
    process.exit(0);
})();
