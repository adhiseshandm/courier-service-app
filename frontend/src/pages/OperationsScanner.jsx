import React, { useState, useEffect, useRef } from 'react';
import { Scan, Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { updateConsignmentStatus } from '../services/api';

const OperationsScanner = () => {
    const [scanInput, setScanInput] = useState('');
    const [lastScanned, setLastScanned] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const inputRef = useRef(null);

    // Auto-focus input
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [lastScanned, error, successMsg]);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!scanInput.trim()) return;

        const consignmentId = scanInput.trim();
        setScanInput(''); // Clear immediately for next scan
        setLoading(true);
        setError('');
        setSuccessMsg('');

        // Default action: In Transit (Scan usually means arrival at hub)
        // We can add toggle for mode later. For now, assume "In Transit" or "Arrived"
        try {
            await updateConsignmentStatus(consignmentId, 'In Transit', 'Hub Scan');
            setLastScanned({ id: consignmentId, status: 'In Transit', time: new Date().toLocaleTimeString() });
            setSuccessMsg(`Scanned: ${consignmentId}`);
        } catch (err) {
            setError(`Failed to update ${consignmentId}`);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                alert('Help: Scan barcode or type ID and press Enter.');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-mono font-bold mb-8 flex items-center gap-3">
                <Scan size={40} className="text-green-400" />
                OPS SCANNER MODE
            </h1>

            {/* Scanner Input */}
            <form onSubmit={handleScan} className="w-full max-w-3xl mb-12">
                <input
                    ref={inputRef}
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="SCAN BARCODE OR TYPE ID..."
                    className="w-full bg-gray-800 border-2 border-gray-700 focus:border-green-500 text-3xl font-mono p-6 rounded-2xl outline-none text-center shadow-2xl transition-all"
                    autoFocus
                />
                <p className="text-gray-500 text-center mt-4 font-mono">Press ENTER to submit • Keep scanner focused</p>
            </form>

            {/* Status Display */}
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Last Action Card */}
                <div className={`p-8 rounded-3xl border-4 ${error ? 'border-red-500 bg-red-900/20' : successMsg ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800'} transition-all duration-300 flex flex-col items-center justify-center min-h-[200px]`}>
                    {loading ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                    ) : error ? (
                        <>
                            <AlertTriangle size={64} className="text-red-500 mb-4" />
                            <h2 className="text-3xl font-bold text-red-400 mb-2">ERROR</h2>
                            <p className="text-xl">{error}</p>
                        </>
                    ) : successMsg ? (
                        <>
                            <CheckCircle size={64} className="text-green-500 mb-4" />
                            <h2 className="text-3xl font-bold text-green-400 mb-2">SUCCESS</h2>
                            <p className="text-xl font-mono">{lastScanned?.id}</p>
                            <span className="bg-green-600 px-4 py-1 rounded-full text-sm font-bold mt-2">{lastScanned.status}</span>
                        </>
                    ) : (
                        <p className="text-2xl text-gray-600 font-mono">READY TO SCAN</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <ActionButton icon={<Package />} label="In Transit (Default)" shortcut="Auto" color="bg-blue-600 hover:bg-blue-500" />
                    <ActionButton icon={<Truck />} label="Out for Delivery" shortcut="Press F2 (Todo)" color="bg-orange-600 hover:bg-orange-500 opacity-50 cursor-not-allowed" />
                    <ActionButton icon={<CheckCircle />} label="Mark Delivered" shortcut="Press F3 (Todo)" color="bg-green-600 hover:bg-green-500 opacity-50 cursor-not-allowed" />
                </div>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, shortcut, color }) => (
    <button className={`flex items-center justify-between p-6 rounded-2xl ${color} transition-all text-left group`}>
        <div className="flex items-center gap-4">
            {icon}
            <span className="text-xl font-bold">{label}</span>
        </div>
        <span className="text-xs bg-black/20 px-2 py-1 rounded font-mono group-hover:bg-black/30 transition-colors">{shortcut}</span>
    </button>
);

export default OperationsScanner;
