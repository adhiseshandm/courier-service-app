const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
    sender: {
        name: { type: String, required: true },
        email: { type: String, required: true }, // Added for OTP
        phone: { type: String, required: true },

        address: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branch: { type: String, default: 'Main Branch' },
    receiver: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        destination: { type: String, required: true }, // e.g., "COIMBATORE", "MUMBAI"
        pincode: { type: String, required: true }
    },
    packageDetails: {
        weight: { type: Number, required: true }, // in kg
        type: { type: String, enum: ['Document', 'Non-Document'], default: 'Non-Document' },
        contentDescription: String,
        declaredValue: Number
    },
    serviceType: {
        type: String,
        enum: ['Domestic', 'Air Cargo', 'Surface', 'DTDC Plus', 'Laptop'],
        default: 'Domestic'
    },
    consignmentType: {
        type: String,
        enum: ['C', 'D', 'V'],
        default: 'D' // Defaulting to D (Domestic?) or just Require it. Let's default to D.
    },
    cost: {

        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' }
    },
    status: {
        type: String,
        enum: ['Booked', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Booked'
    },
    otpVerified: { type: Boolean, default: false },
    bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consignment', consignmentSchema);
