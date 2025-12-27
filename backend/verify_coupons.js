const { pool } = require('./src/config/db');
const { v4: uuidv4 } = require('uuid');

// Use global fetch (Node 18+)
const fetchApi = global.fetch;

if (!fetchApi) {
     console.error("❌ global.fetch is not available. Please use Node.js 18+");
     process.exit(1);
}

const API_URL = 'http://localhost:5000/api/v1'; // Adjust port if needed
const ADMIN_USER = {
     name: 'CouponVerifier',
     email: 'verifier@example.com',
     password: 'password123',
     phone: '9999999999',
     role: 'admin'
};

const TEST_COUPON = {
     code: 'VERIFY_TEST_2024',
     description: 'Automated Test Coupon',
     discount_type: 'percentage',
     discount_value: 15,
     min_order_amount: 100,
     usage_limit: 10,
     is_active: true,
     valid_until: new Date(Date.now() + 86400000).toISOString()
};

async function main() {
     let adminToken = '';
     let userId = null;
     let couponId = null;

     try {
          console.log('--- Starting Coupon API Verification ---');

          // 1. Setup Admin User directly in DB
          console.log('Creating temporary admin user...');
          const { hashPassword } = require('./src/utils/hash');
          const hashedPassword = await hashPassword(ADMIN_USER.password);

          // Check if user exists
          const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN_USER.email]);
          if (existing.length > 0) {
               userId = existing[0].id;
               // Ensure is admin
               await pool.query('UPDATE users SET role = "admin" WHERE id = ?', [userId]);
          } else {
               userId = uuidv4();
               await pool.query(
                    'INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, ADMIN_USER.name, ADMIN_USER.email, hashedPassword, ADMIN_USER.phone, ADMIN_USER.role]
               );
          }
          console.log(`Admin user ready (ID: ${userId})`);

          // 2. Login to get Token
          console.log('Logging in...');
          const loginRes = await fetchApi(`${API_URL}/auth/login`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email: ADMIN_USER.email, password: ADMIN_USER.password })
          });

          if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
          const loginData = await loginRes.json();
          adminToken = loginData.token;
          console.log('Login successful, token received.');

          // 3. Create Coupon via API
          console.log('Creating coupon...');
          const createRes = await fetchApi(`${API_URL}/coupons`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
               },
               body: JSON.stringify(TEST_COUPON)
          });

          if (!createRes.ok) {
               const err = await createRes.json();
               console.error('Create coupon failed:', err);
               throw new Error(`Create coupon failed: ${createRes.status}`);
          }
          const createData = await createRes.json();
          couponId = createData.coupon.id;
          console.log(`Coupon created (ID: ${couponId})`);

          // 4. Verify Coupon exists in List
          console.log('Fetching all coupons...');
          const listRes = await fetchApi(`${API_URL}/coupons`, {
               headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          const listData = await listRes.json();
          const found = listData.data.find(c => c.code === TEST_COUPON.code);
          if (!found) throw new Error('Created coupon not found in list!');
          console.log('Coupon found in list.');

          // 5. Validate Coupon (Consumer view)
          console.log('Validating coupon...');
          const validateRes = await fetchApi(`${API_URL}/coupons/validate`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
               },
               body: JSON.stringify({
                    code: TEST_COUPON.code,
                    orderAmount: 200,
                    cartItems: []
               })
          });

          if (!validateRes.ok) {
               const err = await validateRes.json();
               console.error('Validation failed:', err);
               throw new Error(`Validation failed: ${validateRes.status}`);
          }
          const validateData = await validateRes.json();
          if (!validateData.isValid) throw new Error('Coupon should be valid but API returned invalid');

          // Expected discount: 15% of 200 = 30
          if (validateData.discountAmount !== 30) throw new Error(`Expected discount 30 (15% of 200), got ${validateData.discountAmount}`);
          console.log('Coupon validated successfully.');

          // 6. Delete Coupon
          console.log('Deleting coupon...');
          const deleteRes = await fetchApi(`${API_URL}/coupons/${couponId}`, {
               method: 'DELETE',
               headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);
          console.log('Coupon deleted.');

          console.log('✅ ALL TESTS PASSED');

     } catch (err) {
          console.error('❌ VERIFICATION FAILED:', err);
          process.exit(1);
     } finally {
          // Cleanup User
          if (userId) {
               console.log('Cleaning up test user...');
               await pool.query('DELETE FROM users WHERE id = ?', [userId]);
          }
          if (couponId) {
               await pool.query('DELETE FROM coupons WHERE id = ?', [couponId]);
          }
          await pool.end();
     }
}

main();
