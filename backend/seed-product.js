
const db = require('./src/config/db');

async function seedProduct() {
    try {
        console.log("Seeding Product ID 6...");

        // Check if exists first
        const [rows] = await db.query('SELECT id FROM products WHERE id = 6');
        if (rows.length > 0) {
            console.log("Product ID 6 already exists.");
            process.exit(0);
        }

        // Insert product
        await db.query(`
            INSERT INTO products (id, name, slug, price, rating, review_count)
            VALUES (6, 'A2 Gir Cow Ghee', 'a2-gir-cow-ghee', 1200, 0, 0)
        `);
        console.log("✓ Product ID 6 inserted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding product:", error);
        process.exit(1);
    }
}

seedProduct();
