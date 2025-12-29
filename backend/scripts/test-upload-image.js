const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
    try {
        console.log('1. Preparing IMAGE upload test...');

        // Create a dummy JPEG file
        const filePath = path.join(__dirname, 'test-image.jpg');
        // Simple 1 pixel JPEG header (fake) but sufficient for extension check
        // Real checking uses file-type usually, but here based on simple middleware it's mostly extension
        // Let's copy a real file if possible, or just create a text file with .jpg extension 
        // because standard multer fileFilter only checks extension and mimetype string, not magic bytes unless configured deep.
        // Our middleware:
        // const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
        // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        // const mimetype = allowedTypes.test(file.mimetype);

        fs.writeFileSync(filePath, 'fake image content');

        const formData = new FormData();
        formData.append('name', 'Image Tester');
        formData.append('email', 'image@test.com');
        formData.append('subject', 'Image Upload Test');
        formData.append('message', 'This is a test with an image.');
        formData.append('attachment', fs.createReadStream(filePath));

        console.log('2. Sending contact form with IMAGE...');

        const response = await axios.post('http://localhost:5000/api/v1/contact', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('✅ Upload Success:', response.data);

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('❌ Upload Failed:', error.response ? error.response.data : error.message);
        if (error.response?.data?.message) {
            console.error('Server Message:', error.response.data.message);
        }
    }
}

testImageUpload();
