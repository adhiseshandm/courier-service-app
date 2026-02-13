const { calculateRate } = require('../utils/rateCalculator');

exports.calculateRate = (req, res) => {
    try {
        const { weight, destination, type, serviceType } = req.body;

        const price = calculateRate(weight, destination, type, serviceType);

        res.json({
            weight,
            destination,
            serviceType,
            cost: price,
            currency: 'INR'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Calculation failed' });
    }
};

const Rate = require('../models/Rate');

// Get all configured rates
exports.getRates = async (req, res) => {
    try {
        let rates = await Rate.find();
        // If no rates in DB, seed defaults (optional, or handle in frontend)
        if (rates.length === 0) {
            // Seed default logic if needed, for now return empty or basic
            rates = [
                { _id: '1', serviceType: 'Air Cargo', basePrice: 150, pricePerKg: 150 },
                { _id: '2', serviceType: 'Surface', basePrice: 80, pricePerKg: 80 },
                { _id: '3', serviceType: 'Laptop', basePrice: 550, pricePerKg: 200 }
            ];
        }
        res.json(rates);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
};

// Update or Create a Rate
exports.updateRate = async (req, res) => {
    try {
        const { serviceType, basePrice, pricePerKg } = req.body;

        let rate = await Rate.findOne({ serviceType });
        if (rate) {
            rate.basePrice = basePrice;
            rate.pricePerKg = pricePerKg;
            await rate.save();
        } else {
            rate = await Rate.create({ serviceType, basePrice, pricePerKg, zone: 'Default' });
        }

        res.json({ message: 'Rate updated successfully', rate });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update rate' });
    }
};


