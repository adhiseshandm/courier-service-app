const https = require('https');

const FAST2SMS_HOST = 'www.fast2sms.com';
const FAST2SMS_PATH = '/dev/bulkV2';

/**
 * Send SMS using Fast2SMS (Native HTTPS)
 * @param {string} phone - 10 digit phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>}
 */
const sendSms = (phone, otp) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            console.warn('[SMS] FAST2SMS_API_KEY missing. Skipping SMS.');
            resolve({ success: false, message: 'API Key missing' });
            return;
        }

        const queryParams = new URLSearchParams({
            authorization: apiKey,
            route: 'otp',
            variables_values: otp,
            flash: '0',
            numbers: phone
        });

        const options = {
            hostname: FAST2SMS_HOST,
            path: `${FAST2SMS_PATH}?${queryParams.toString()}`,
            method: 'GET',
            headers: {
                'cache-control': 'no-cache'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`[SMS] Sent to ${phone}:`, body);
                    try {
                        resolve({ success: true, data: JSON.parse(body) });
                    } catch (e) {
                        resolve({ success: true, data: body });
                    }
                } else {
                    console.error(`[SMS API ERROR] ${res.statusCode}: ${body}`);
                    reject(new Error(`SMS API Failed: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[SMS NETWORK ERROR] Failed to send to ${phone}:`, e.message);
            reject(e);
        });

        req.end();
    });
};

module.exports = { sendSms };
