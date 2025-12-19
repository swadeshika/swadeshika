const db = require('../src/config/db');
require('dotenv').config();

const productsToSeed = [
    {
        id: 6,
        name: "A2 Gir Cow Ghee",
        slug: "a2-gir-cow-ghee",
        price: 1200,
        compare_price: 1400,
        sku: "GHEE-002",
        category_id: 1, // Assuming Ghee category exists or using 1 as fallback
        stock_quantity: 100,
        description: "Experience the unmatched purity...",
        short_description: "Premium A2 ghee from free-grazing Gir cows",
        is_active: 1
    },
    {
        id: 1, // Updating Test Product or ensuring consistency
        name: "Pure Desi Cow Ghee",
        slug: "pure-desi-cow-ghee",
        price: 850,
        compare_price: 1000,
        sku: "GHEE-001",
        category_id: 1,
        stock_quantity: 100,
        description: "Experience the rich, authentic taste...",
        short_description: "Traditional bilona method ghee",
        is_active: 1
    },
    {
        id: 2,
        name: "Organic Turmeric Powder",
        slug: "organic-turmeric-powder",
        price: 180,
        compare_price: 220,
        sku: "SPICE-001",
        category_id: 2, // Spices
        stock_quantity: 100,
        description: "Our premium Organic Turmeric Powder...",
        short_description: "High curcumin organic turmeric powder",
        is_active: 1
    },
    {
        id: 3,
        name: "Premium Kashmiri Almonds",
        slug: "premium-kashmiri-almonds",
        price: 650,
        compare_price: null,
        sku: "DRY-001",
        category_id: 3, // Dry Fruits
        stock_quantity: 100,
        description: "Indulge in the finest Premium Kashmiri Almonds...",
        short_description: "Handpicked Kashmiri almonds",
        is_active: 1
    },
    {
        id: 4,
        name: "Cold Pressed Coconut Oil",
        slug: "cold-pressed-coconut-oil",
        price: 320,
        compare_price: null,
        sku: "OIL-001",
        category_id: 4, // Oils
        stock_quantity: 100,
        description: "Our Cold Pressed Coconut Oil...",
        short_description: "Cold pressed coconut oil for cooking and beauty",
        is_active: 1
    }
];

async function seed() {
    try {
        await db.connectDB();
        console.log('Connected to DB');

        for (const p of productsToSeed) {
            console.log(`Processing ${p.name} (ID: ${p.id})...`);

            // Check if exists
            const [rows] = await db.query('SELECT id FROM products WHERE id = ?', [p.id]);

            if (rows.length > 0) {
                console.log(`Update product ${p.id}`);
                await db.query(`
                    UPDATE products SET 
                    name=?, slug=?, price=?, compare_price=?, sku=?, 
                    description=?, short_description=?, is_active=?
                    WHERE id=?
                `, [p.name, p.slug, p.price, p.compare_price, p.sku, p.description, p.short_description, p.is_active, p.id]);
            } else {
                console.log(`Insert product ${p.id}`);
                // Allow inserting explicit ID
                await db.query(`
                    INSERT INTO products 
                    (id, name, slug, price, compare_price, sku, category_id, stock_quantity, description, short_description, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [p.id, p.name, p.slug, p.price, p.compare_price, p.sku, 1, p.stock_quantity, p.description, p.short_description, p.is_active]);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
