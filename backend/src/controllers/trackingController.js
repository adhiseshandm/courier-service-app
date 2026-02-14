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

        // Mock Coordinates Logic
        const getCoordinates = (location) => {
            if (!location) return [21.1458, 79.0882]; // Default Hub

            const coords = {
                'Mumbai': [19.0760, 72.8777],
                'Delhi': [28.7041, 77.1025],
                'Bangalore': [12.9716, 77.5946],
                'Chennai': [13.0827, 80.2707],
                'Kolkata': [22.5726, 88.3639],
                'Hyderabad': [17.3850, 78.4867],
                'Pune': [18.5204, 73.8567],
                'Hub': [21.1458, 79.0882],
                'Main Branch': [12.9716, 77.5946],
                'Coimbatore': [11.0168, 76.9558],
                'Salem': [11.6643, 78.1460],
                'Tiruppur': [11.1085, 77.3411],
                'Erode': [11.3410, 77.7172],
                'Trichy': [10.7905, 78.7047],
                'Madurai': [9.9252, 78.1198],
            };

            // Fuzzy match or default
            const key = Object.keys(coords).find(k => location.includes(k));
            return key ? coords[key] : coords['Hub'];
        };

        const originLocation = consignment.branch || 'Main Branch';
        const destLocation = consignment.receiver.destination || 'Hub';
        const currentLocation = consignment.status === 'Delivered' ? destLocation : (consignment.status === 'Booked' ? originLocation : 'Hub');

        res.json({
            success: true,
            data: {
                ...consignment.toObject(),
                history,
                originCoords: getCoordinates(originLocation),
                destCoords: getCoordinates(destLocation),
                currentCoords: getCoordinates(currentLocation)
            }
        });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location } = req.body;

        const consignment = await Consignment.findByIdAndUpdate(
            id,
            { status, branch: location || 'Hub' },
            { new: true }
        );

        if (!consignment) {
            return res.status(404).json({ success: false, message: 'Consignment not found' });
        }

        // Emit Real-time Update
        const io = req.app.get('io');
        if (io) {
            io.to(id).emit('tracking-update', {
                status: consignment.status,
                location: consignment.branch,
                updatedAt: new Date()
            });
            console.log(`📡 Emitted update for ${id}: ${status}`);
        }

        res.json({ success: true, message: 'Status updated', data: consignment });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
