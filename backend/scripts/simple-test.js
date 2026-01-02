const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

async function test() {
    try {
        console.log('Testing connection to ' + API_URL);
        const res = await axios.get(API_URL + '/health');
        console.log('Health:', res.data);

        console.log('Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testadmin@swadeshika.com',
            password: 'testadmin123'
        });
        console.log('Login success:', loginRes.data.success);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}
test();
