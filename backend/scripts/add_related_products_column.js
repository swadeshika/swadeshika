const db = require('../src/config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('Checking if related_products column exists...');
    
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'related_products'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('Column related_products already exists. Skipping.');
      return;
    }

    console.log('Adding related_products column (JSON) to products table...');
    // Using JSON type for storing array of IDs [1, 2, 3]
    await conn.query(`ALTER TABLE products ADD COLUMN related_products JSON DEFAULT NULL`);
    
    console.log('Migration successful: related_products column added.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    conn.release();
    process.exit();
  }
}

migrate();
