import React, { useState } from 'react';
import WeightScale from './WeightScale';

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
        sender: { name: '', phone: '', address: '', pincode: '' }, // Removed email
        receiver: { name: '', phone: '', address: '', destination: '', pincode: '' },
        packageDetails: { weight: 0, type: 'Non-Document', contentDescription: '', declaredValue: 0 },
        serviceType: 'Domestic',
        consignmentType: 'D'
    });

    const [costData, setCostData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                // otp: removed
            };
            const result = await bookConsignment(bookingPayload);
            if (result.success) {
                setSuccess(`Booking Confirmed! ID: ${result.bookingId || result.consignmentId}`);
                // setIsOtpOpen(false); // Removed
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

    // calculateRate handles... (no change needed)

    // handleVerifyBooking removed completely

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Header / Status */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-[#0a192f]">New Consignment</h2>
                    <p className="text-gray-500 text-sm">Fill in the details to book a shipment</p>
                </div>
                {success && (
                    <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <CheckCircle size={18} />
                            <span className="font-medium">{success}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        const { downloadLabel } = await import('../services/api');
                                        const id = success.match(/ID: ([a-zA-Z0-9]+)/)?.[1] || success.split(': ')[1]; // Extract ID
                                        if (id) await downloadLabel(id);
                                    } catch (e) { alert('Failed to load label'); console.error(e); }
                                }}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 flex items-center space-x-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                                <span>Print Label</span>
                            </button>
                            <button onClick={() => setSuccess('')} className="text-green-800 font-bold p-1 hover:bg-green-200 rounded">&times;</button>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <AlertCircle size={18} />
                        <span className="font-medium">{error}</span>
                        <button onClick={() => setError('')} className="ml-2 text-red-800 font-bold">&times;</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Form Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Sender & Receiver Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Sender */}
                            <div>
                                <SectionHeader icon={User} title="Sender Details" />
                                <div className="space-y-4">
                                    <InputField placeholder="Sender Name" val={formData.sender.name} onChange={v => handleInputChange('sender', 'name', v)} />
                                    <InputField placeholder="Phone Number" val={formData.sender.phone} onChange={v => handleInputChange('sender', 'phone', v)} />
                                    {/* <InputField placeholder="Email (for Receipt)" val={formData.sender.email} onChange={v => handleInputChange('sender', 'email', v)} /> Removed */}
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

                {/* Right Column: Calculations & Actions */}
                <div className="space-y-6">
                    <div className="bg-[#0a192f] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600/20 rounded-full -ml-5 -mb-5 blur-xl"></div>

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

                    {/* Quick Stats or Info could go here */}
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


        </motion.div>
    );
};


export default BookingForm;
