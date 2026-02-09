const db = require('../src/config/db');

async function migrate() {
    try {
        // console.log('Starting migration: Adding status column to reviews table...');

        // Check columns
        const [columns] = await db.query("SHOW COLUMNS FROM reviews LIKE 'status'");
        
        if (columns.length > 0) {
            // console.log('Column "status" already exists. Skipping add column.');
        } else {
            // Add status column
            await db.query(`
                ALTER TABLE reviews 
                ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER is_approved
            `);
            // console.log('Column "status" added successfully.');
        }

        // Migrate data based on is_approved
        // console.log('Migrating existing data...');
        // If is_approved = 1, set status = 'approved'
        await db.query("UPDATE reviews SET status = 'approved' WHERE is_approved = 1 AND status = 'pending'");
        // If is_approved = 0, set status = 'pending' (default)
        // Optionally, if you had rejected logic, apply here. For now, unapproved = pending.
        
        // console.log('Data migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
