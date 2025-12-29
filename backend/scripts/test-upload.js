const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/v1';

async function testFileUpload() {
    try {
        console.log('1. Preparing file upload test...');

        const filePath = path.join(__dirname, 'test-upload.pdf');
        fs.writeFileSync(filePath, 'This is a test attachment content.');

        const formData = new FormData();
        formData.append('name', 'Upload Tester');
        formData.append('email', 'uploader@example.com');
        formData.append('subject', 'Test Upload');
        formData.append('message', 'Testing file upload functionality');
        formData.append('attachment', fs.createReadStream(filePath));

        console.log('2. Sending contact form with attachment...');

        const res = await axios.post(`${API_URL}/contact`, formData, {
            headers: formData.getHeaders()
        });

        if (res.data.success) {
            console.log('✅ Upload Success:', res.data);
        } else {
            console.log('❌ Upload Response:', res.data);
        }

        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('❌ Upload Failed:', error.response ? error.response.data : error.message);
    }
}

testFileUpload();
