const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function testCreateWithNullParent() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.data.accessToken;
        console.log('Token obtained.');

        // 2. Create Category with explicit parent_id: null
        console.log('Creating category with parent_id: null...');
        const payload = {
            name: 'Null Parent Test ' + Date.now(),
            slug: 'null-parent-test-' + Date.now(),
            parent_id: null
        };

        const createRes = await axios.post(`${BASE_URL}/categories`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Success! Created category:', createRes.data.data);

        // Cleanup
        await axios.delete(`${BASE_URL}/categories/${createRes.data.data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Cleanup successful.');

    } catch (error) {
        console.error('❌ Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testCreateWithNullParent();
