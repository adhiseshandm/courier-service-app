import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, Copy, Check } from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../services/api';

const BookingHistory = ({ onSelect }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/bookings/recent`, {
                headers: getHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Poll every 30 seconds to update status
        const interval = setInterval(fetchHistory, 30000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (id, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return <div className="p-4 text-center text-gray-400 text-sm">Loading history...</div>;

    if (bookings.length === 0) return (
        <div className="p-6 text-center border-l border-gray-100 h-full">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={20} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No recent bookings</p>
        </div>
    );

    return (
        <div className="h-full bg-white border-l border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center sticky top-0">
                <h3 className="font-bold text-gray-700 flex items-center">
                    <Clock size={16} className="mr-2 text-blue-500" /> Recent Bookings
                </h3>
                <button onClick={fetchHistory} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Refresh</button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="group bg-white hover:bg-blue-50 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition-all cursor-pointer relative"
                        onClick={() => onSelect && onSelect(booking._id)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-blue-200 group-hover:text-blue-800 transition-colors">
                                {booking._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.status === 'Booked' ? 'bg-yellow-100 text-yellow-700' :
                                    booking.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-semibold text-gray-800 truncate w-32" title={booking.receiver.destination}>
                                    {booking.receiver.destination}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={(e) => copyToClipboard(booking._id, e)}
                                    className="p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Copy ID"
                                >
                                    {copiedId === booking._id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                                <a
                                    href={`/track?id=${booking._id}`}
                                    onClick={(e) => e.stopPropagation()} // Prevent parent click if needed, or let it flow
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                    title="Track"
                                >
                                    <ChevronRight size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingHistory;
