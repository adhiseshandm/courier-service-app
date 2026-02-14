const Consignment = require('../models/Consignment');
const { calculateRate } = require('../utils/rateCalculator');

exports.bookConsignment = async (req, res) => {
    const { sender, receiver, packageDetails, serviceType, consignmentType } = req.body;

    // Direct Booking - No OTP

    try {
        // FRAUD PREVENTION 1: Calculate Cost Server-Side
        const calculatedCost = calculateRate(
            packageDetails.weight,
            receiver.destination,
            packageDetails.type,
            serviceType
        );

        console.log(`[BOOKING] New Request by ${sender.name}. Server Cost: ${calculatedCost}`);

        const consignment = new Consignment({
            sender,
            receiver,
            packageDetails,
            serviceType,
            consignmentType,
            cost: { amount: calculatedCost, currency: 'INR' }, // Enforce Server Cost
            otpVerified: true, // Auto-verified since we removed OTP
            status: 'Booked',
            branch: req.user.branch || 'Main Branch',
            processedBy: req.user._id
        });

        await consignment.save();

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
