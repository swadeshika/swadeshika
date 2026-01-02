
const db = require('./src/config/db');

async function createTables() {
    try {
        console.log("Creating tables...");

        // Create site_analytics table
        await db.query(`
            CREATE TABLE IF NOT EXISTS site_analytics (
                metric_key VARCHAR(255) PRIMARY KEY,
                metric_value INT DEFAULT 0
            )
        `);
        console.log("✓ site_analytics table created/verified.");

        // Create visitor_logs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS visitor_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45),
                user_agent TEXT,
                page_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ visitor_logs table created/verified.");

        console.log("All tables created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating tables:", error);
        process.exit(1);
    }
}

createTables();
