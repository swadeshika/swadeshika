const db = require('../src/config/db');

async function seedReviews() {
    try {
        // console.log('🌱 Seeding reviews...');

        // 1. Clear existing reviews
        await db.query('DELETE FROM reviews');
        // console.log('Cleared existing reviews.');

        // 2. Check and Add Columns
        // console.log('Checking products table schema...');
        const [columns] = await db.pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${require('../src/config/env').DB_NAME}' 
            AND TABLE_NAME = 'products'
        `);
        
        const columnNames = columns.map(c => c.COLUMN_NAME);
        // console.log('Existing columns:', columnNames);

        if (!columnNames.includes('average_rating')) {
            // console.log('Adding average_rating column...');
            await db.pool.query('ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0');
        } else {
            // console.log('average_rating column already exists.');
        }

        if (!columnNames.includes('review_count')) {
            // console.log('Adding review_count column...');
            await db.pool.query('ALTER TABLE products ADD COLUMN review_count INT DEFAULT 0');
        } else {
            // console.log('review_count column already exists.');
        }

        // 3. Fetch Products and Users
        const [products] = await db.query('SELECT id FROM products');
        const [users] = await db.query('SELECT id FROM users');

        if (products.length === 0) {
            // console.log('No products found to review.');
            process.exit(0);
        }

        let userIds = users.map(u => u.id);
        if (userIds.length === 0) {
            // console.log('No users found. Creating a dummy user for reviews...');
            const dummyId = 'seed-user-' + Date.now();
            await db.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
                [dummyId, 'Reviewer', 'reviewer@test.com', 'hashedpassword', 'customer']);
            userIds = [dummyId];
        }

        // 3. Mock Data
        const comments = [
            "Absolutely love this product! The quality is unmatched.",
            "Pure and authentic. Reminds me of home.",
            "Great packaging and fast delivery. Will order again.",
            "The taste is genuine and very fresh.",
            "Highly recommended! Worth every penny.",
            "Good product, expected a bit more quantity but quality is top notch.",
            "Excellent quality, much better than store bought.",
            "Very satisfied with the purchase.",
            "Genuine organic product. You can feel the difference.",
            "My family loves it. Will become a regular customer.",
            "Smells amazing and tastes even better.",
            "Best I have found in the market so far.",
            "Authentic and pure. Just like homemade.",
            "Really good quality. Will definitely buy again.",
            "Value for money product."
        ];

        const titles = [
            "Excellent", "Great Quality", "Loved it", "Value for Money", "Authentic", 
            "Highly Recommended", "Good Purchase", "Very Happy", "Amazing", "Best Choice"
        ];

        // 4. Insert Reviews
        let totalReviews = 0;
        const reviewValues = [];

        for (const product of products) {
            // Generate 10 to 15 reviews per product
            const numReviews = Math.floor(Math.random() * 6) + 10; 

            for (let i = 0; i < numReviews; i++) {
                const userId = userIds[Math.floor(Math.random() * userIds.length)];
                const rating = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
                const comment = comments[Math.floor(Math.random() * comments.length)];
                const title = titles[Math.floor(Math.random() * titles.length)];
                const isVerified = Math.random() > 0.3; // 70% verified

                reviewValues.push([
                    product.id,
                    userId,
                    rating,
                    title,
                    comment,
                    isVerified,
                    true // is_approved
                ]);
            }
            totalReviews += numReviews;
        }

        // Batch insert to avoid huge query
        // MySQL placeholder limit is usually high but let's chunk it to be safe (e.g., 500 reviews per batch)
        const batchSize = 500;
        for (let i = 0; i < reviewValues.length; i += batchSize) {
            const batch = reviewValues.slice(i, i + batchSize);
            const sql = 'INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified, is_approved) VALUES ?';
            await db.pool.query(sql, [batch]);
        }
        
        // console.log(`✅ Inserted ${totalReviews} reviews.`);

        // 5. Update Product Statistics
        // console.log('Updating product statistics...');
        
        // Reset all counts first
        await db.pool.query('UPDATE products SET review_count = 0, average_rating = 0');
        
        // Update with new aggregations
        const updateSql = `
            UPDATE products p 
            JOIN (
                SELECT product_id, COUNT(*) as cnt, AVG(rating) as avg_rt 
                FROM reviews 
                GROUP BY product_id
            ) r ON p.id = r.product_id 
            SET p.review_count = r.cnt, p.average_rating = r.avg_rt
        `;
        await db.pool.query(updateSql);

        // console.log('✅ Product statistics updated successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding reviews:', err);
        process.exit(1);
    }
}

seedReviews();
