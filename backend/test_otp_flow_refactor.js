const http = require('http');

// Configuration
const BASE_URL = 'localhost';
const PORT = 5002;

// 1. Login Function
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            username: 'dharmaraj9700',
            password: 'dharma@4816'
        });

        const req = http.request({
            hostname: BASE_URL,
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const token = JSON.parse(body).token;
                    resolve(token);
                } else {
                    reject(new Error(`Login failed: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// 2. Send OTP Function
function sendOtp(token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            phone: '9876543210',
            email: 'adhiseshan2005@gmail.com'
        });

        const req = http.request({
            hostname: BASE_URL,
            port: PORT,
            path: '/api/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`OTP Status: ${res.statusCode}`);
                console.log(`OTP Body: ${body}`);
                if (res.statusCode === 200) resolve();
                else reject(new Error('OTP failed'));
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Run Test
async function run() {
    try {
        console.log('Logging in...');
        const token = await login();
        console.log('✅ Logged in. Token received.');

        console.log('Sending OTP...');
        await sendOtp(token);
        console.log('✅ OTP Test Passed.');
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

run();
