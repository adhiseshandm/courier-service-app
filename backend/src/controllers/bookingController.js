const Consignment = require('../models/Consignment');
const { sendSms } = require('../config/sms');
const { calculateRate } = require('../utils/rateCalculator');

// Mock in-memory OTP store
const otpStore = new Map();

exports.generateOtp = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(phone, otp);

    console.log(`[OTP] Generated ${otp} for ${phone}`);

    try {
        // Use SMS Service
        await sendSms(phone, otp);
        res.json({ success: true, message: 'OTP sent to mobile number' });
    } catch (error) {
        console.error('[OTP ERROR]', error);
        res.status(500).json({ error: 'Failed to send OTP via SMS. Please try again.' });
    }
};



exports.verifyOtpAndBook = async (req, res) => {
    const { sender, receiver, packageDetails, serviceType, consignmentType, otp } = req.body;

    const storedOtp = otpStore.get(sender.phone);

    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
        // FRAUD PREVENTION 1: Calculate Cost Server-Side
        const calculatedCost = calculateRate(
            packageDetails.weight,
            receiver.destination,
            packageDetails.type,
            serviceType
        );

        console.log(`[AUDIT] Booking by ${sender.name}. Server Cost: ${calculatedCost}`);

        const consignment = new Consignment({
            sender,
            receiver,
            packageDetails,
            serviceType,
            consignmentType,
            cost: { amount: calculatedCost, currency: 'INR' }, // Enforce Server Cost
            otpVerified: true,
            status: 'Booked',
            branch: req.user.branch || 'Main Branch',
            processedBy: req.user._id
        });

        await consignment.save();

        // Clear OTP
        otpStore.delete(sender.phone);

        // SMS Receipt (Fire and Forget)
        const message = `Booking Confirmed!\nID: ${consignment._id}\nTo: ${receiver.destination}\nCost: Rs.${calculatedCost}\nThank you!`;

        // Non-blocking SMS send
        sendSms(sender.phone, message).catch(err => console.error('[SMS RECEIPT FAIL]', err));

        res.status(201).json({
            success: true,
            message: 'Booking confirmed',
            consignmentId: consignment._id,
            verifiedCost: calculatedCost
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Booking failed' });
    }
};
