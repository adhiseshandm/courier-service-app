import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const branches = [
    { id: 'mettupalayam', name: 'Mettupalayam', address: 'Main Road, Mettupalayam' },
    { id: 'thoppampatti', name: 'Thoppampatti', address: 'Kousalya Complex, Thoppampatti' },
    { id: 'thudiyalur', name: 'Thudiyalur', address: 'Mettupalayam Road, Thudiyalur' },
    { id: 'rspuram', name: 'RS Puram', address: 'DB Road, RS Puram' }
];

const BranchSelection = () => {
    const navigate = useNavigate();

    const handleSelectBranch = (branch) => {
        localStorage.setItem('selectedBranch', JSON.stringify(branch));
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 z-10"
            >
                <div className="bg-white p-3 rounded-xl inline-block mb-6 shadow-xl">
                    <img src="/logo.png" alt="DTDC+" className="h-10 w-auto" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">Select Your Branch</h1>
                <p className="text-blue-200">Choose your location to proceed to the portal</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
                {branches.map((branch, index) => (
                    <motion.button
                        key={branch.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelectBranch(branch)}
                        className="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 text-left hover:scale-[1.02] hover:shadow-2xl hover:border-red-500/30"
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                            <ArrowRight />
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 group-hover:text-white group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{branch.name}</h3>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin size={14} className="mr-1" />
                                    {branch.address}
                                </div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default BranchSelection;
