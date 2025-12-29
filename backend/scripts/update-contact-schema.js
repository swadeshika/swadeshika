const db = require('../src/config/db');

async function updateSchema() {
    try {
        console.log('Adding attachment columns...');
        await db.query(`
            ALTER TABLE contact_submissions 
            ADD COLUMN attachment_url VARCHAR(500) NULL AFTER message,
            ADD COLUMN attachment_name VARCHAR(255) NULL AFTER attachment_url
        `);
        console.log('✅ Schema updated successfully');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Columns already exist');
            process.exit(0);
        }
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchema();
