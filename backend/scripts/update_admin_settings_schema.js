const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const updateSchema = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'swadeshika_ecommerce',
            multipleStatements: true
        });

        console.log('Connected. Altering admin_settings table...');

        const query = `
      ALTER TABLE admin_settings
      ADD COLUMN IF NOT EXISTS enabled_gateways JSON,
      ADD COLUMN IF NOT EXISTS gateway_configs JSON;
    `;

        await connection.query(query);

        console.log('✅ Schema updated successfully: Added enabled_gateways and gateway_configs columns.');

    } catch (error) {
        console.error('❌ Failed to update schema:', error);
    } finally {
        if (connection) await connection.end();
    }
};

updateSchema();
