const db = require('../src/config/db');

async function testSQL() {
    try {
        console.log('Testing SQL syntax...');
        // Use a temporary table name to avoid conflict
        const query = `
        CREATE TABLE IF NOT EXISTS contact_submissions_test (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(255) NOT NULL,
          order_number VARCHAR(50),
          message TEXT NOT NULL,
          attachment_url VARCHAR(500),
          attachment_name VARCHAR(255),
          status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await db.query(query);
        console.log('✅ SQL Syntax is valid.');

        // Cleanup
        await db.query('DROP TABLE contact_submissions_test');
        console.log('✅ Cleanup done.');
        process.exit(0);
    } catch (error) {
        console.error('❌ SQL Error:', error.sqlMessage || error.message);
        process.exit(1);
    }
}

testSQL();
