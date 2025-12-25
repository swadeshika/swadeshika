
const db = require('../src/config/db');

async function cleanup() {
    try {
        console.log("Cleaning up broken data for empty User IDs...");

        // 1. Delete Cart Items
        await db.query("DELETE FROM cart_items WHERE user_id = '' OR user_id IS NULL");
        console.log(" - Cleared orphan cart items");

        // 2. Delete Addresses (if any)
        try {
            await db.query("DELETE FROM addresses WHERE user_id = '' OR user_id IS NULL");
            console.log(" - Cleared orphan addresses");
        } catch (e) { console.log(" - No addresses table or delete failed"); }

        // 3. Delete Orders (if any)
        try {
            await db.query("DELETE FROM orders WHERE user_id = '' OR user_id IS NULL");
            console.log(" - Cleared orphan orders");
        } catch (e) { console.log(" - No orders table or delete failed"); }

        // 4. Delete Users
        const [result] = await db.query("DELETE FROM users WHERE id = '' OR id IS NULL");
        console.log(` - Deleted ${result.affectedRows} broken user(s).`);

        console.log("\n✅ Cleanup Complete. Please REGISTER a new account.");
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

cleanup();
