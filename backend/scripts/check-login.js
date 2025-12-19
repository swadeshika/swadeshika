const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');
const http = require('http');

async function testLogin() {
    try {
        const [users] = await db.query('SELECT email FROM users LIMIT 1');
        if (users.length === 0) {
            console.log('No users found to test login');
            process.exit();
        }
        const email = users[0].email;
        const password = 'Password@123'; // Assuming default or I'll try to find one. 
        // Note: I don't know the password. 
        // But even with wrong password, I should get 401, NOT "Failed to fetch".
        // "Failed to fetch" is a connection error, NOT an HTTP error response (like 401/500).
        // If I get 401 via script, Backend IS REACHABLE.

        const postData = JSON.stringify({ email, password: 'wrongpassword' });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            }
        };

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.on('data', (d) => {
                const s = d.toString();
                console.log('BODY:', s.substring(0, 100)); // Log first 100 chars
            });
        });

        req.on('error', (e) => {
            console.error(`PROBLEM: ${e.message}`);
        });

        req.write(postData);
        req.end();

    } catch (err) {
        console.error(err);
    }
}

testLogin();
