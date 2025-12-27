const db = require('./src/config/db');

(async () => {
    await db.connectDB();
    const [rows] = await db.query('SELECT id, name, in_stock, stock_quantity FROM products');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
})();
