require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function initSettings() {
    try {
        console.log('Dropping existing table to ensure schema match...');
        await db.query('DROP TABLE IF EXISTS admin_settings');

        console.log('Creating admin_settings table...');
        await db.query(`
            CREATE TABLE admin_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                store_name VARCHAR(255) DEFAULT 'Swadeshika',
                support_email VARCHAR(255) DEFAULT 'support@swadeshika.com',
                support_phone VARCHAR(50) DEFAULT '+91 0000000000',
                store_address TEXT,
                logo_data_url LONGTEXT,
                guest_checkout BOOLEAN DEFAULT FALSE,
                default_order_status VARCHAR(50) DEFAULT 'pending',
                currency VARCHAR(10) DEFAULT 'inr',
                shipping_method VARCHAR(50) DEFAULT 'flat_rate',
                free_shipping_threshold DECIMAL(10,2) DEFAULT 500.00,
                flat_rate DECIMAL(10,2) DEFAULT 50.00,
                gst_percent DECIMAL(5,2) DEFAULT 18.00,
                prices_include_tax BOOLEAN DEFAULT FALSE,
                ga_id VARCHAR(50),
                search_console_id VARCHAR(50),
                timezone VARCHAR(50) DEFAULT 'asia-kolkata',
                units VARCHAR(10) DEFAULT 'metric',
                low_stock_threshold INT DEFAULT 5,
                allow_backorders BOOLEAN DEFAULT FALSE,
                two_factor_enabled BOOLEAN DEFAULT FALSE,
                enabled_gateways JSON,
                gateway_configs JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Inserting default settings...');
        await db.query(`
            INSERT INTO admin_settings 
            (store_name, support_email, support_phone, currency, gst_percent, flat_rate, free_shipping_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['Swadeshika', 'support@swadeshika.com', '+91 0000000000', 'inr', 18.00, 50.00, 500.00]);
        console.log('Default settings inserted.');

    } catch (err) {
        console.error('Error initializing settings:', err);
    } finally {
        process.exit();
    }
}

initSettings();
