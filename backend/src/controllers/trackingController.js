const Consignment = require('../models/Consignment');

exports.trackConsignment = async (req, res) => {
    try {
        const { id } = req.params;
        const consignment = await Consignment.findById(id).select('sender.name receiver.destination status bookingDate packageDetails.weight serviceType cost');

        if (!consignment) {
            return res.status(404).json({ success: false, message: 'Consignment not found' });
        }

        // Mock history for visual timeline (since we don't have a history table yet)
        // In a real app, this would come from a TrackingHistory model
        const history = [
            { status: 'Booked', date: consignment.bookingDate, location: consignment.branch || 'Main Branch', completed: true },
            { status: 'In Transit', date: null, location: 'Hub', completed: consignment.status === 'In Transit' || consignment.status === 'Out for Delivery' || consignment.status === 'Delivered' },
            { status: 'Out for Delivery', date: null, location: consignment.receiver.destination, completed: consignment.status === 'Out for Delivery' || consignment.status === 'Delivered' },
            { status: 'Delivered', date: null, location: consignment.receiver.destination, completed: consignment.status === 'Delivered' }
        ];

        res.json({
            success: true,
            data: {
                ...consignment.toObject(),
                history
            }
        });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
