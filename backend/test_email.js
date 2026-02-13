require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    // console.log('Pass:', process.env.EMAIL_PASS); // Security: Don't log pass

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/ /g, '') // Try removing spaces
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self
        subject: 'Test Email from Courier App',
        text: 'If you see this, email configuration is working!'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.response);
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

testEmail();
