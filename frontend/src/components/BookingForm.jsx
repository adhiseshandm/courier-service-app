import React, { useState } from 'react';
import WeightScale from './WeightScale';
import BookingHistory from './BookingHistory';
import { calculateRate, bookConsignment } from '../services/api';
import { User, MapPin, Package, Truck, Calculator, CheckCircle, AlertCircle, Send, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-800">
            <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
);

const InputField = ({ placeholder, val, onChange, type = "text" }) => (
    <input
        type={type}
        className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all focus:bg-white"
        placeholder={placeholder}
        value={val || ''}
        onChange={e => onChange(e.target.value)}
    />
);

const BookingForm = () => {
    const [formData, setFormData] = useState({
        sender: { name: '', phone: '', address: '', pincode: '' },
        receiver: { name: '', phone: '', address: '', destination: '', pincode: '' },
        packageDetails: { weight: 0, type: 'Non-Document', contentDescription: '', declaredValue: 0 },
        serviceType: 'Domestic',
        consignmentType: 'D'
    });

    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleLevel1Change = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleWeightChange = (newWeight) => {
        setFormData(prev => ({
            ...prev,
            packageDetails: { ...prev.packageDetails, weight: newWeight }
        }));
        setCostData(null);
    };

    const handleCalculate = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await calculateRate({
                weight: formData.packageDetails.weight,
                destination: formData.receiver.destination,
                type: formData.packageDetails.type,
                serviceType: formData.serviceType
            });
            setCostData(result);
        } catch (err) {
            setError('Failed to calculate rate. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateBooking = async () => {
        if (!costData) return setError('Please calculate rate first');

        setLoading(true);
        try {
            const bookingPayload = {
                ...formData,
                cost: { amount: costData.cost, currency: costData.currency },
            };
            const result = await bookConsignment(bookingPayload);
            if (result.success) {
                setSuccess(`Booking Confirmed! ID: ${result.bookingId || result.consignmentId}`);
                setRefreshHistoryTrigger(prev => prev + 1); // Trigger history update
                setFormData({
                    sender: { name: '', phone: '', address: '', pincode: '' },
                    receiver: { name: '', phone: '', address: '', destination: '', pincode: '' },
                    packageDetails: { weight: 0, type: 'Non-Document', contentDescription: '', declaredValue: 0 },
                    serviceType: 'Domestic',
                    consignmentType: 'D'
                });
                setCostData(null);
            } else {
                alert('Booking failed: ' + result.error);
            }
        } catch (err) {
            alert('Booking failed');
        } finally {
            setLoading(false);
        }
    };

    // Only Sidebar logic changes here, keeping component logic same

    // Success View
    if (success) {
        const bookingId = success.match(/ID: ([a-zA-Z0-9]+)/)?.[1] || success.split(': ')[1];

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                <div className="flex-1 space-y-8 text-center pt-10">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100">
                        {/* ... Success Content (same as before) ... */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-8">Your consignment has been successfully booked.</p>

                        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Consignment ID</p>
                            <div className="flex items-center justify-center space-x-3">
                                <span className="text-3xl font-mono font-bold text-[#0a192f] select-all">{bookingId}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        const { downloadLabel } = await import('../services/api');
                                        await downloadLabel(bookingId);
                                    } catch (e) { alert('Failed to load label'); }
                                }}
                                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                            >
                                <span className="text-lg">🏷️</span>
                                <span>Print Label</span>
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        const { downloadInvoice } = await import('../services/api');
                                        await downloadInvoice(bookingId);
                                    } catch (e) { alert('Failed to load invoice'); }
                                }}
                                className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition-all"
                            >
                                <span className="text-lg">📄</span>
                                <span>Invoice</span>
                            </button>

                            <a
                                href="/track"
                                className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-700 py-3 rounded-xl font-bold transition-all"
                            >
                                <span className="text-lg">🚚</span>
                                <span>Track Status</span>
                            </a>

                            <button
                                onClick={() => {
                                    setSuccess('');
                                    setCostData(null);
                                }}
                                className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition-all"
                            >
                                <span className="text-lg">📦</span>
                                <span>Book Another</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar in Success View - Sticky */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <BookingHistory key={refreshHistoryTrigger} />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Main Form Area */}
                <div className="flex-1 w-full space-y-6">

                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0a192f]">New Consignment</h2>
                            <p className="text-gray-500 text-sm">Fill in the details to book a shipment</p>
                        </div>
                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                                <AlertCircle size={18} />
                                <span className="font-medium">{error}</span>
                                <button onClick={() => setError('')} className="ml-2 text-red-800 font-bold">&times;</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Left Column: Form Details */}
                        <div className="xl:col-span-2 space-y-6">

                            {/* Sender & Receiver Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Sender */}
                                    <div>
                                        <SectionHeader icon={User} title="Sender Details" />
                                        <div className="space-y-4">
                                            <InputField placeholder="Sender Name" val={formData.sender.name} onChange={v => handleInputChange('sender', 'name', v)} />
                                            <InputField placeholder="Phone Number" val={formData.sender.phone} onChange={v => handleInputChange('sender', 'phone', v)} />
                                            <InputField placeholder="Address" val={formData.sender.address} onChange={v => handleInputChange('sender', 'address', v)} />
                                            <InputField placeholder="Pincode" val={formData.sender.pincode} onChange={v => handleInputChange('sender', 'pincode', v)} />
                                        </div>
                                    </div>

                                    {/* Receiver */}
                                    <div>
                                        <SectionHeader icon={MapPin} title="Receiver Details" />
                                        <div className="space-y-4">
                                            <InputField placeholder="Receiver Name" val={formData.receiver.name} onChange={v => handleInputChange('receiver', 'name', v)} />
                                            <InputField placeholder="Phone Number" val={formData.receiver.phone} onChange={v => handleInputChange('receiver', 'phone', v)} />
                                            <InputField placeholder="Address" val={formData.receiver.address} onChange={v => handleInputChange('receiver', 'address', v)} />
                                            <InputField placeholder="Destination City" val={formData.receiver.destination} onChange={v => handleInputChange('receiver', 'destination', v)} />
                                            <InputField placeholder="Pincode" val={formData.receiver.pincode} onChange={v => handleInputChange('receiver', 'pincode', v)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Package Details Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionHeader icon={Package} title="Shipment Info" />

                                <div className="mb-6">
                                    <WeightScale onWeightChange={handleWeightChange} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <select className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50" onChange={e => handleInputChange('packageDetails', 'type', e.target.value)} value={formData.packageDetails.type}>
                                        <option value="Non-Document">Non-Document</option>
                                        <option value="Document">Document</option>
                                    </select>

                                    <select className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50" onChange={e => handleLevel1Change('serviceType', e.target.value)} value={formData.serviceType}>
                                        <option value="Domestic">Domestic</option>
                                        <option value="Air Cargo">Air Cargo</option>
                                        <option value="Surface">Surface</option>
                                        <option value="DTDC Plus">DTDC Plus</option>
                                    </select>

                                    <select className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50" onChange={e => handleLevel1Change('consignmentType', e.target.value)} value={formData.consignmentType}>
                                        <option value="D">D (Document)</option>
                                        <option value="C">C (Consignment)</option>
                                        <option value="V">V (Value)</option>
                                    </select>

                                    <InputField placeholder="Value (₹)" type="number" val={formData.packageDetails.declaredValue} onChange={v => handleInputChange('packageDetails', 'declaredValue', v)} />
                                </div>
                                <div className="mt-4">
                                    <InputField placeholder="Content Description" val={formData.packageDetails.contentDescription} onChange={v => handleInputChange('packageDetails', 'contentDescription', v)} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Inner): Calculations */}
                        <div className="space-y-6">
                            <div className="bg-[#0a192f] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <SectionHeader icon={Calculator} title="Rate Estimation" />
                                <div className="mt-4 text-center">
                                    {costData ? (
                                        <div>
                                            <p className="text-gray-400 text-sm uppercase tracking-wide">Total Cost</p>
                                            <div className="text-4xl font-bold mt-2 flex justify-center items-start text-green-400">
                                                <span className="text-xl mt-1 mr-1">₹</span>
                                                {costData.cost}
                                            </div>
                                            <p className="text-xs text-blue-200 mt-2">Zone: {costData.zone} | Rate/kg: ₹{costData.ratePerKg}</p>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 py-8">
                                            <p>Enter details to calculate</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={handleCalculate}
                                        disabled={loading}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Calculator size={18} />
                                        <span>{loading ? 'Calculating (v2)...' : 'Calculate Rate'}</span>
                                    </button>

                                    {costData && (
                                        <button
                                            onClick={handleInitiateBooking}
                                            disabled={loading}
                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/50 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2"
                                        >
                                            <Send size={18} />
                                            <span>Book Consignment</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                    <Wallet size={16} className="mr-2 text-blue-600" /> Payment Mode
                                </h4>
                                <div className="flex space-x-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">Prepaid</span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">COD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Sticky, Outside the Main Form Area */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <BookingHistory key={refreshHistoryTrigger} />
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default BookingForm;
