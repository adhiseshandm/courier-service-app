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
        const matchStage = {};

        // If Admin, show everything (or keep it restricted if they want to see nothing in booking history?)
        // The user said "individual tracking history for individual branches". 
        // So a Branch User should only see their branch's bookings.

        if (req.user.role !== 'admin') {
            // Filter by the branch of the logged-in user
            // Assuming the user model has a 'branch' field. 
            // If not, we fall back to processedBy which is already there.
            // But 'processedBy' only shows bookings *they* made.
            // If they want 'Branch' level visibility, we should query by branch.

            if (req.user.branch) {
                matchStage.branch = req.user.branch;
            } else {
                matchStage.processedBy = req.user._id; // Fallback to personal if no branch assigned
            }
        }

        const bookings = await Consignment.find(matchStage)
            .sort({ bookingDate: -1 })
            .limit(20) // Increased limit
            .select('receiver.destination status bookingDate cost.amount branch');

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Fetch Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
