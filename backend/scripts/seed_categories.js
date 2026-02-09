const db = require('../src/config/db');

async function seedCategories() {
    try {
        // console.log('🌱 Seeding categories...');

        const categories = [
            ['Ghee', 'ghee', 'Pure and organic ghee products'],
            ['Spices', 'spices', 'Authentic Indian spices'],
            ['Oils', 'oils', 'Cold-pressed and organic oils']
        ];

        for (const cat of categories) {
            await db.query(
                `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
                cat
            );
        }

        // console.log('✅ Categories seeded successfully');

        const [rows] = await db.query('SELECT * FROM categories');
        console.table(rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding categories:', err.message);
        process.exit(1);
    }
}

seedCategories();
