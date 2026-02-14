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
            discount: req.body.discount || 0, // Apply Discount
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
        console.error('Booking Error:', error);
        res.status(500).json({ error: error.message || 'Booking failed' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Consignment.find({ processedBy: req.user._id })
            .sort({ bookingDate: -1 })
            .limit(10)
            .select('receiver.destination status bookingDate cost.amount');

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Fetch Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
