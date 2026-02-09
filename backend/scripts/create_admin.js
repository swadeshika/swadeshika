const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/hash');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'AdminPassword123!';
        const name = 'Admin User';
        const phone = '9999999999';

        // console.log(`🚀 Creating/Updating Admin User...`);
        // console.log(`Email: ${email}`);
        // console.log(`Password: ${password}`);

        // Check if user exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        const hashedPassword = await hashPassword(password);

        if (rows.length > 0) {
            // Update existing user to admin
            await db.query(
                'UPDATE users SET role = "admin", password = ?, name = ? WHERE email = ?',
                [hashedPassword, name, email]
            );
            // console.log('✅ Existing user updated to ADMIN role.');
        } else {
            // Create new admin user
            const id = uuidv4();
            await db.query(
                'INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, "admin")',
                [id, email, hashedPassword, name, phone]
            );
            // console.log('✅ New ADMIN user created.');
        }

        // console.log('\n✨ You can now login with these credentials to get the token.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }
}

createAdmin();
