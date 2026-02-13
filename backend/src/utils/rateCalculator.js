const rates = require('../config/rates.json');

// Helper to determine region based on destination string
const getRegionRates = (destination, rateList) => {
    // Normalize destination
    const dest = destination.toUpperCase();

    // Direct match ?
    let match = rateList.find(r => r.destination && r.destination.toUpperCase() === dest);
    if (match) return match;

    // Partial match checks
    if (dest.includes('TAMIL') || dest.includes('PONDY')) {
        return rateList.find(r => r.destination.includes('TAMILNADU'));
    }
    if (dest.includes('KERALA') || dest.includes('KARNATAKA')) {
        return rateList.find(r => r.destination.includes('KERALA'));
    }
    if (dest.includes('ANDHRA') || dest.includes('TELANGANA') || dest.includes('TELEGANA')) {
        return rateList.find(r => r.destination.includes('ANDHRA'));
    }
    if (['MUMBAI', 'DELHI', 'KOLKATA', 'HYDERABAD'].some(city => dest.includes(city))) {
        // Check if specific metro rates exist
        const metro = rateList.find(r => r.destination && (r.destination.includes('MUMBAI') || r.destination.includes('DELHI')));
        if (metro) return metro;
    }

    // Default to North India/Rest of India if nothing else matches
    const northern = rateList.find(r => r.destination && (r.destination.includes('NORTH INDIA') || r.destination.includes('OTHER PLACE')));
    return northern;
};

const calculateRate = (weight, destination, type, serviceType) => {
    let price = 0;

    // 1. Domestic Rate Tariff (Default)
    if (!serviceType || serviceType === 'Domestic') {
        const domesticRates = rates.domestic_rate_tariff.rates;
        const rateRow = getRegionRates(destination, domesticRates);

        if (!rateRow) throw new Error('Destination not found in tariff');

        if (weight <= 0.250 && rateRow['0.250_kg']) {
            price = rateRow['0.250_kg'];
        } else if (weight <= 0.500) {
            price = rateRow['0.500_kg'];
        } else if (weight <= 1.000) {
            price = rateRow['1.00_kg'];
        } else {
            // Basic Fallback for > 1kg in Domestic Slab
            if (weight > 1.0 && weight <= 5.0) {
                // Use 1kg rate * weight (Simple Linear)
                price = rateRow['1.00_kg'] * Math.ceil(weight);
            } else if (weight > 5.0) {
                // Use Air Cargo Logic
                const airRates = rates.air_cargo_above_5kgs_all_types.rates;
                const airRow = getRegionRates(destination, airRates);
                if (airRow) {
                    price = airRow['6_to_25_kgs'] * Math.ceil(weight);
                }
            }
        }
    }

    // 2. Air Cargo (> 5kg)
    if (serviceType === 'Air Cargo' || (weight > 5 && !serviceType)) {
        const airRates = rates.air_cargo_above_5kgs_all_types.rates;
        const rateRow = getRegionRates(destination, airRates);
        if (rateRow) {
            price = rateRow['6_to_25_kgs'] * Math.ceil(weight);
        }
    }

    // 3. Surface (> 5kg)
    if (serviceType === 'Surface') {
        const surfRates = rates.surface_cargo_above_5kgs_all_types.rates;
        const rateRow = getRegionRates(destination, surfRates);
        if (rateRow) {
            if (rateRow['above_5kg_per_25kg_d_series']) {
                price = rateRow['above_5kg_per_25kg_d_series'] * Math.ceil(weight);
            } else if (rateRow['above_26kg_per_100kg_d_series']) {
                price = rateRow['above_26kg_per_100kg_d_series'] * Math.ceil(weight);
            }
        }
    }

    // 4. Laptop
    if (serviceType === 'Laptop') {
        const laptopRates = rates.laptop_booking_rates.rates;
        const rateRow = getRegionRates(destination, laptopRates);
        if (rateRow && weight <= 3) {
            price = rateRow['upto_3_kgs'];
        } else {
            price = 1600; // default max base
            if (weight > 5) {
                price += (Math.ceil(weight) - 5) * 200;
            }
        }
    }

    return price;
};

module.exports = { calculateRate };
