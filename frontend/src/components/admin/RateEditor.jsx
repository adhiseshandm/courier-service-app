import React, { useState, useEffect } from 'react';
import { getRates, updateRate } from '../../services/api';
import { Settings, X, Save } from 'lucide-react';

const RateEditor = ({ onClose }) => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRates();
    }, []);

    const loadRates = () => {
        getRates().then(data => {
            setRates(data);
            setLoading(false);
        }).catch(console.error);
    };

    const handleUpdate = async (rate) => {
        try {
            await updateRate(rate);
            alert(`Updated ${rate.serviceType}!`);
        } catch (err) {
            alert('Failed to update rate');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-[#0a192f] text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings size={20} /> Rate Configuration
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-500 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        Adjust the base price and per-kg rate for each service type. Changes take effect immediately for new bookings.
                    </p>

                    <div className="grid gap-6">
                        {loading ? <p>Loading Rates...</p> : rates.map((rate, idx) => (
                            <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0a192f]">{rate.serviceType}</h3>
                                    <p className="text-sm text-gray-500">Zone: {rate.zone || 'Default'}</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Base Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-32 p-2 rounded border font-bold text-gray-800"
                                            value={rate.basePrice}
                                            onChange={(e) => {
                                                const newRates = [...rates];
                                                newRates[idx].basePrice = Number(e.target.value);
                                                setRates(newRates);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Price / Kg (₹)</label>
                                        <input
                                            type="number"
                                            className="w-32 p-2 rounded border font-bold text-gray-800"
                                            value={rate.pricePerKg}
                                            onChange={(e) => {
                                                const newRates = [...rates];
                                                newRates[idx].pricePerKg = Number(e.target.value);
                                                setRates(newRates);
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(rate)}
                                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <Save size={18} /> <span className="md:hidden">Save</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RateEditor;
