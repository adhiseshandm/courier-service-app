import React, { useState } from 'react';

const OtpModal = ({ isOpen, onClose, onVerify, phone }) => {

    const [otp, setOtp] = useState('');

    // ... (keep useEffect) ...

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Please Verify OTP</h2>
                <div className="mb-6 space-y-2">
                    <p className="text-gray-600">Enter the 6-digit code sent to:</p>
                    <p className="font-semibold text-lg">{phone}</p>
                </div>




                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-3xl tracking-[0.5em] font-mono focus:border-blue-500 focus:outline-none transition-colors"
                    maxLength="6"
                    placeholder="000000"
                    autoFocus
                />


                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onVerify(otp)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Verify & Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpModal;
