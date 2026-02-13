import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline
    const { login } = useAuth();
    const navigate = useNavigate();
    const [branch, setBranch] = useState(null);

    useEffect(() => {
        const storedBranch = localStorage.getItem('selectedBranch');
        if (!storedBranch) {
            navigate('/');
            return;
        }
        setBranch(JSON.parse(storedBranch));

        const checkServer = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/ping');
                if (res.ok) setServerStatus('online');
                else setServerStatus('offline');
            } catch (e) {
                setServerStatus('offline');
            }
        };
        checkServer();
        const interval = setInterval(checkServer, 5000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(username, password);
        if (result.success) {
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/booking');
            }
        } else {
            setError(result.error);
        }
    };

    if (!branch) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 z-10"
            >
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 text-blue-200 hover:text-white text-sm flex items-center transition-colors"
                >
                    ← Change Branch
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-6 shadow-xl mx-auto w-auto inline-flex overflow-hidden">
                        <img src="/logo.png" alt="DTDC+" className="h-24 object-contain block" />
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-wide">Enterprise Portal</h1>
                    <p className="text-blue-200 text-lg mt-2 font-medium">{branch.name} Branch</p>
                    <p className="text-blue-200/50 text-xs mt-1">Secure Access for Employees & Admins</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 text-blue-300/50 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full bg-black/20 border border-white/10 text-white placeholder-blue-200/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all hover:bg-black/30"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 text-blue-300/50 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-black/20 border border-white/10 text-white placeholder-blue-200/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all hover:bg-black/30"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-200 text-sm text-center bg-red-500/20 py-2 rounded-lg border border-red-500/20"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3.5 rounded-xl hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0a192f] transform transition-all active:scale-[0.98] shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2"
                    >
                        <span>Sign In</span>
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <div className={`text-xs inline-flex items-center space-x-2 px-3 py-1 rounded-full ${serverStatus === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span>Server Status: {serverStatus.toUpperCase()}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
