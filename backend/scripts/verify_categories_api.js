const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

let token = '';
let categoryId = '';

async function runVerification() {
    try {
        console.log('🚀 Starting Categories API Verification...');

        // 1. Login as Admin
        console.log('\n1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        // Extract token safely
        if (loginRes.data && loginRes.data.data && loginRes.data.data.accessToken) {
            token = loginRes.data.data.accessToken;
            console.log('✅ Login successful.');
            console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
        } else {
            console.error('❌ Login response format unexpected:', JSON.stringify(loginRes.data, null, 2));
            process.exit(1);
        }

        // Decode token payload (debugging)
        const parts = token.split('.');
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                console.log('Token Payload:', JSON.stringify(payload, null, 2));

                // Check expiration
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    console.error('❌ Token is ALREADY EXPIRED! exp:', payload.exp, 'now:', now);
                } else {
                    console.log('Token expires in:', payload.exp - now, 'seconds');
                }
            } catch (e) {
                console.error('❌ Failed to decode token payload:', e.message);
            }
        } else {
            console.error('❌ Token does not have 3 parts (header.payload.signature)');
        }

        // Headers for authorized requests
        const config = {
            headers: { Authorization: `Bearer ${token}` } // Ensure space after Bearer
        };

        // 1.5 Verify Token with /me
        console.log('\n1.5. Verifying Token with /auth/me...');
        try {
            const meRes = await axios.get(`${API_URL}/auth/me`, config);
            console.log('✅ /auth/me successful. User Role:', meRes.data.data.role);
        } catch (err) {
            console.error('❌ /auth/me failed!');
            if (err.response) {
                console.error(`Status: ${err.response.status}`);
                console.error('Data:', JSON.stringify(err.response.data, null, 2));
            } else {
                console.error('Error:', err.message);
            }
            throw new Error('Token verification failed at /auth/me');
        }

        // 2. Create Category
        console.log('\n2. Creating Test Category...');
        const createRes = await axios.post(`${API_URL}/categories`, {
            name: 'Verification Test Category',
            description: 'This is a test category for verification script',
            display_order: 999
        }, config);

        if (createRes.data.success) {
            categoryId = createRes.data.data.id;
            console.log(`✅ Category created successfully. ID: ${categoryId}`);
        } else {
            throw new Error('Failed to create category');
        }

        // 3. Get All Categories
        console.log('\n3. Fetching All Categories...');
        const getAllRes = await axios.get(`${API_URL}/categories`);
        const categories = getAllRes.data.data;
        // Search by ID or Name
        let found = categories.find(c => c.id === categoryId);

        if (!found) {
            found = categories.find(c => c.name === 'Verification Test Category');
            if (found) console.log('Found by name, ID might have mismatch or type issue.');
        }

        if (found) {
            console.log(`✅ Verify: Created category found in list.`);
            // Update ID if we found it by name (just in case ID format differs)
            if (found.id !== categoryId) {
                console.log(`Updating tracked ID from ${categoryId} to ${found.id}`);
                categoryId = found.id;
            }
        } else {
            console.log('Categories list count:', categories.length);
            throw new Error('Created category NOT found in list');
        }

        // 4. Get Category Details
        console.log(`\n4. Fetching Details for ID: ${categoryId}...`);
        const getOneRes = await axios.get(`${API_URL}/categories/${categoryId}`);
        if (getOneRes.data.data.name === 'Verification Test Category') {
            console.log('✅ Verify: Name matches.');
        } else {
            throw new Error('Name mismatch in details view');
        }

        // 5. Update Category
        console.log('\n5. Updating Category...');
        const updateRes = await axios.put(`${API_URL}/categories/${categoryId}`, {
            name: 'Updated Verification Category',
            description: 'Updated description'
        }, config);

        if (updateRes.data.success && updateRes.data.data.name === 'Updated Verification Category') {
            console.log('✅ Update successful. Name changed.');
        } else {
            throw new Error('Failed to update category');
        }

        // 6. Delete Category
        console.log('\n6. Deleting Category...');
        const deleteRes = await axios.delete(`${API_URL}/categories/${categoryId}`, config);
        if (deleteRes.data.success) {
            console.log('✅ Delete successful.');
        } else {
            throw new Error('Failed to delete category');
        }

        // 7. Verify Deletion (Should return 404)
        console.log('\n7. Verifying Deletion (Expect 404)...');
        try {
            await axios.get(`${API_URL}/categories/${categoryId}`);
            throw new Error('❌ Error: Category still exists after deletion!');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Verified: Category not found (404) as expected.');
            } else {
                throw error; // Re-throw other errors
            }
        }

        console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`); // Don't print entire data again if handled above
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runVerification();
