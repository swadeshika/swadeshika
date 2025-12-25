
const db = require('../src/config/db');

async function check() {
    try {
        console.log("Checking for users with empty or null IDs...");
        const [rows] = await db.query("SELECT * FROM users WHERE id = '' OR id IS NULL");

        if (rows.length > 0) {
            console.log("\n❌ FOUND BAD USERS:");
            rows.forEach(u => console.log(`- Name: ${u.name}, Email: ${u.email}, ID: '${u.id}'`));
            console.log("\nExplanation: These users were created before the UUID fix. They have no ID, so their cart items also have no user ID.");
        } else {
            console.log("\n✅ No bad users found. All users have valid IDs.");
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
