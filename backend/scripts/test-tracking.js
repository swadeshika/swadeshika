const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');
const http = require('http');

async function testTracking() {
    try {
        // 1. Get a recent order
        const [orders] = await db.query(
            `SELECT o.id, o.order_number, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC LIMIT 1`
        );

        if (orders.length === 0) {
            console.log('No orders to test.');
            process.exit();
        }

        const { id, order_number, email } = orders[0];
        console.log(`Testing with Order: ${order_number}, Email: ${email}`);

        // 2. Test Success Case (Use Order Number)
        await makeRequest(order_number, email, 'SUCCESS CASE');

        // 3. Test Failure Case (Wrong Email)
        await makeRequest(order_number, 'wrong@example.com', 'FAILURE CASE (Wrong Email)');

        // 4. Test ID Case (UUID)
        // Check if verify by UUID works
        await makeRequest(id, email, 'SUCCESS CASE (UUID)');

    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => process.exit(), 2000);
    }
}

function makeRequest(orderId, email, label) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ orderId, email });
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/v1/orders/track',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            }
        };

        const req = http.request(options, (res) => {
            console.log(`\n[${label}] Status: ${res.statusCode}`);
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                const parsed = JSON.parse(data);
                console.log(`Response: success=${parsed.success}, message=${parsed.message || 'OK'}`);
                resolve();
            });
        });

        req.on('error', (e) => console.error(e));
        req.write(postData);
        req.end();
    });
}

testTracking();
