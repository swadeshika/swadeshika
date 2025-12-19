const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/settings',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem: ${e.message}`);
});

req.end();
