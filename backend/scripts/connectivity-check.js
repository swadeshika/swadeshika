const http = require('http');

const url = 'http://127.0.0.1:5000/api/v1/settings';
console.log(`Checking connectivity to: ${url}`);

http.get(url, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Response Body:', data);
    });
}).on('error', (err) => {
    console.error('Connection Error:', err.message);
});
