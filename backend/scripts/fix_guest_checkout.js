const db = require('../src/config/db');

async function fixGuestCheckout() {
    try {
        console.log("Fixing Guest Checkout Schema...");

        // 1. Allow NULL user_id in addresses
        console.log("Modifying addresses.user_id to be nullable...");
        await db.query(`ALTER TABLE addresses MODIFY COLUMN user_id VARCHAR(36) NULL`);

        // 2. Allow NULL user_id in orders
        console.log("Modifying orders.user_id to be nullable...");
        await db.query(`ALTER TABLE orders MODIFY COLUMN user_id VARCHAR(36) NULL`);

        console.log("✅ Schema updated for Guest Checkout.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing guest checkout:", error);

        // Sometimes Foreign Key constraints prevent modification.
        // We'll try to drop FK first if modification fails usually, but let's see.
        process.exit(1);
    }
}

fixGuestCheckout();
