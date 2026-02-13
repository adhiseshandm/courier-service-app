const Consignment = require('../models/Consignment');

// Mock in-memory OTP store
const otpStore = new Map();

const nodemailer = require('nodemailer');
const { calculateRate } = require('../utils/rateCalculator');

exports.generateOtp = async (req, res) => {
    const { phone, email } = req.body; // Expect email now
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(phone, otp);

    console.log(`[OTP] Generated ${otp} for ${email} (${phone})`);
    console.log('[DEBUG] Env Vars:', {
        User: process.env.EMAIL_USER,
        PassExists: !!process.env.EMAIL_PASS,
        PassLen: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });


    // Create Transporter
    // TODO: move to config/email.js in refactor
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Courier Verification Code',
        text: `Your OTP for booking is: ${otp}`
    };

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL] OTP sent to ${email}`);
            res.json({ success: true, message: 'OTP sent to email' });
        } else {
            console.log('[EMAIL] Credentials missing/invalid. Check server logs.');
            // In production, this should fail. For now, keep mock but don't send OTP back.
            res.json({ success: true, message: 'OTP sent (Mock Mode)' });
        }

    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};



exports.verifyOtpAndBook = async (req, res) => {
    const { sender, receiver, packageDetails, serviceType, consignmentType, otp } = req.body;

    const storedOtp = otpStore.get(sender.phone);

    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
        // FRAUD PREVENTION 1: Calculate Cost Server-Side (Ignore frontend cost)
        const calculatedCost = calculateRate(
            packageDetails.weight,
            receiver.destination,
            packageDetails.type,
            serviceType
        );

        console.log(`[AUDIT] Booking by ${sender.name}. Frontend Cost: IGNORED. Server Cost: ${calculatedCost}`);

        const consignment = new Consignment({
            sender,
            receiver,
            packageDetails,
            serviceType,
            consignmentType,
            cost: { amount: calculatedCost, currency: 'INR' }, // Enforce Server Cost
            otpVerified: true,
            status: 'Booked',
            branch: req.user.branch || 'Main Branch', // Save the branch of the employee who processed it
            processedBy: req.user._id
        });

        await consignment.save();

        // Clear OTP
        otpStore.delete(sender.phone);

        // FRAUD PREVENTION 2: Send Receipt Email to Customer
        // This fails if credentials are invalid, but that's okay (logging it).
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && sender.email) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: sender.email,
                subject: `Booking Confirmed - Consignment #${consignment._id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;">
                        <h2 style="color: #2563eb;">Booking Confirmation</h2>
                        <p>Dear <strong>${sender.name}</strong>,</p>
                        <p>Your consignment has been successfully booked.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Tracking ID:</strong> ${consignment._id}</p>
                            <p><strong>Destination:</strong> ${receiver.destination}</p>
                            <p><strong>Weight:</strong> ${packageDetails.weight} kg</p>
                            <p><strong>Service:</strong> ${serviceType}</p>
                            <h3 style="color: #166534; margin-top: 10px;">Total Paid: ₹${calculatedCost}</h3>
                        </div>

                        <p style="font-size: 12px; color: #666;">
                            If the amount shown above is different from what you paid, please report it immediately to admin@courier.com.
                        </p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions).catch(err => console.error('[EMAIL RECEIPT FAIL]', err));
            console.log(`[RECEIPT] Sent to ${sender.email}`);
        }

        res.status(201).json({
            success: true,
            message: 'Booking confirmed',
            consignmentId: consignment._id,
            verifiedCost: calculatedCost // Return true cost to frontend to show user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Booking failed' });
    }
};
