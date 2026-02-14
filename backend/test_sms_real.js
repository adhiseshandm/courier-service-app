require('dotenv').config();
const { sendSms } = require('./src/config/sms');

async function test() {
    console.log('Testing SMS Sending...');
    // Using a dummy number or the user's number if available. 
    // Since I don't have a verified number, I will try with a generic test number 
    // but the API might reject it. However, the response will tell us if Auth worked.
    // I'll use a random 10 digit number.
    const phone = '9999999999';
    const otp = '123456';

    try {
        const result = await sendSms(phone, otp);
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
