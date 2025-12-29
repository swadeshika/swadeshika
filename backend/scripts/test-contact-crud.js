const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

async function testContactCRUD() {
    try {
        const email = 'testadmin@swadeshika.com';
        const password = 'testadmin123';

        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });

        const token = loginRes.data.data.accessToken;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Logged in successfully');

        console.log('\n2. Creating a new contact submission (Public)...');
        const newContact = {
            name: "Test User",
            email: "test@example.com",
            phone: "1234567890",
            subject: "Test Subject",
            message: "This is a test message"
        };
        const createRes = await axios.post(`${API_URL}/contact`, newContact);
        console.log('✅ Created:', createRes.data);

        console.log('\n3. Fetching all contacts (Admin)...');
        const listRes = await axios.get(`${API_URL}/contact`, config);
        const contacts = listRes.data.data.submissions;
        console.log(`✅ Fetched ${contacts.length} contacts`);

        // Find our created contact
        // Note: The API might return paginated result at `data.data.submissions` or `data.data` depending on implementation
        // ContactService.getAllSubmissions returns { submissions, total... }
        // Controller returns { success: true, data: result }
        // So axios.data.data will be { submissions: [], total: ... }
        // So contacts reference should be listRes.data.data.submissions

        const createdContact = contacts.find(c => c.subject === "Test Subject" && c.message === "This is a test message");
        if (!createdContact) {
            console.log('List:', JSON.stringify(contacts, null, 2));
            throw new Error("Created contact not found in list");
        }
        const id = createdContact.id;
        console.log('✅ Found created contact ID:', id);

        console.log(`\n4. Fetching contact details for ID ${id}...`);
        const detailRes = await axios.get(`${API_URL}/contact/${id}`, config);
        console.log('✅ Details:', detailRes.data.data.subject);

        console.log(`\n5. Updating status to 'read'...`);
        const updateRes = await axios.put(`${API_URL}/contact/${id}`, { status: 'read' }, config);
        console.log('✅ Updated status:', updateRes.data.message);

        console.log(`\n6. Replying to contact...`);
        const replyRes = await axios.post(`${API_URL}/contact/${id}/reply`, { message: "Reply test" }, config);
        console.log('✅ Replied:', replyRes.data.message);

        console.log(`\n7. Archiving (Soft Delete) contact...`);
        const deleteRes = await axios.delete(`${API_URL}/contact/${id}`, config);
        console.log('✅ Archived:', deleteRes.data.message);

        console.log(`\n8. Verifying contact is archived...`);
        // By default findAll hides archived.
        // We can check by GET /:id which should still work?
        // contactModel.findById does NOT check status. So it should return the record with status='archived'.
        const verifyRes = await axios.get(`${API_URL}/contact/${id}`, config);
        if (verifyRes.data.data.status === 'archived') {
            console.log('✅ ID ' + id + ' status is now archived');
        } else {
            console.error('❌ ID ' + id + ' status is ' + verifyRes.data.data.status);
            throw new Error("Status mismatch");
        }

        console.log('\n🎉 All Contact CRUD tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

testContactCRUD();
