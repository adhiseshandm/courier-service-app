// Node fetch removed
const http = require('http');


const data = JSON.stringify({
    phone: '9876543210',
    email: 'adhiseshan2005@gmail.com'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/send-otp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
