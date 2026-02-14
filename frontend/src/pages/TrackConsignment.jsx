import React, { useState } from 'react';
import { Search, ArrowRight, Download } from 'lucide-react';
import { trackConsignment, downloadInvoice } from '../services/api';
import TrackingTimeline from '../components/TrackingTimeline';

const TrackConsignment = () => {
    const [trackingId, setTrackingId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError('');
        setTrackingData(null);

        try {
            const response = await trackConsignment(trackingId);
            if (response.success) {
                setTrackingData(response.data);
            } else {
                setError(response.message || 'Consignment not found');
            }
        } catch (err) {
            setError('Failed to track consignment. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!trackingData) return;
        try {
            await downloadInvoice(trackingData._id);
        } catch (err) {
            alert('Failed to download invoice');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-[#0a192f]">Track Your Shipment</h1>
                <p className="text-gray-500 text-lg">Enter your consignment ID to track real-time status</p>
            </div>

            {/* Search Box */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto flex items-center">
                <div className="pl-4 text-gray-400">
                    <Search size={24} />
                </div>
                <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g., 65c4...)"
                    className="flex-1 p-4 outline-none text-lg text-gray-700 bg-transparent"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                />
                <button
                    onClick={handleTrack}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                    <span>{loading ? 'Searching...' : 'Track'}</span>
                    {!loading && <ArrowRight size={20} />}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100 max-w-2xl mx-auto">
                    {error}
                </div>
            )}

            {/* Results */}
            {trackingData && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-[#0a192f] text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <p className="text-blue-200 text-sm uppercase tracking-wider mb-1">Consignment ID</p>
                            <h2 className="text-2xl font-mono font-bold tracking-wide">{trackingData._id}</h2>
                        </div>
                        <div className="mt-4 md:mt-0 text-right flex items-center space-x-3">
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                            >
                                <Download size={16} />
                                <span>Invoice</span>
                            </button>
                            <span className="bg-green-500/20 text-green-300 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/30">
                                {trackingData.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <p className="text-gray-500 text-sm mb-2">Origin</p>
                                <h3 className="font-bold text-lg text-gray-800">{trackingData.sender.name}</h3>
                                <p className="text-gray-600">{trackingData.branch || 'Main Branch'}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <p className="text-gray-500 text-sm mb-2">Destination</p>
                                <h3 className="font-bold text-lg text-gray-800">{trackingData.receiver.destination}</h3>
                                <p className="text-gray-600">Expected Delivery: Soon</p>
                            </div>
                        </div>

                        <TrackingTimeline history={trackingData.history} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackConsignment;
