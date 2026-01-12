const db = require('../src/config/db');

async function checkCartIntegrity() {
    try {
        console.log("Checking Cart Items for Orphans...");
        const [orphans] = await db.query(`
            SELECT c.* 
            FROM cart_items c 
            LEFT JOIN products p ON c.product_id = p.id 
            WHERE p.id IS NULL
        `);

        if (orphans.length > 0) {
            console.log(`❌ Found ${orphans.length} orphaned cart items:`);
            console.table(orphans);
            console.log("Cleaning up orphans...");
            await db.query(`DELETE c FROM cart_items c LEFT JOIN products p ON c.product_id = p.id WHERE p.id IS NULL`);
            console.log("✅ Cleanup complete.");
        } else {
            console.log("✅ No orphaned cart items found.");
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Error checking cart:", error);
        process.exit(1);
    }
}

checkCartIntegrity();
