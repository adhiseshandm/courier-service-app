const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
    zone: { type: String, required: true, default: 'Default' },
    serviceType: { type: String, required: true }, // e.g., 'Air Cargo', 'Surface', 'Laptop'
    basePrice: { type: Number, required: true }, // Initial cost
    pricePerKg: { type: Number, required: true }, // Cost per additional kg
    description: { type: String }
});

module.exports = mongoose.model('Rate', RateSchema);
