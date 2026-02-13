import React, { useState } from 'react';
import { Settings, X, Save, AlertTriangle } from 'lucide-react';

const SystemSettings = ({ onClose }) => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSave = () => {
        // Logic to save settings to backend would go here
        alert('Settings Saved! (Simulation)');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-[#0a192f] text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings size={20} /> System Settings
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-full text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Maintenance Mode</h3>
                                <p className="text-xs text-gray-500">Disable customer access</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={maintenanceMode}
                                onChange={(e) => setMaintenanceMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div>
                            <h3 className="font-bold text-gray-800">Email Notifications</h3>
                            <p className="text-xs text-gray-500">Receive alerts for new bookings</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-[#0a192f] text-white py-3 rounded-xl font-bold hover:bg-[#112240] transition flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
