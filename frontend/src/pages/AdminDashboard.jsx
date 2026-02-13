
import React, { useEffect, useState } from 'react';
import { getDashboardStats, exportReport } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, TrendingUp, Package, DollarSign, Mail, Users, ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ManageEmployees from '../components/admin/ManageEmployees';
import RateEditor from '../components/admin/RateEditor';
import SystemSettings from '../components/admin/SystemSettings';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Dashboard Crash:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 rounded-xl border border-red-200">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
                    <div className="bg-white p-4 rounded overflow-auto border border-red-100 font-mono text-sm mb-4">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const AdminDashboardContent = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEmployees, setShowEmployees] = useState(false);
    const [showRates, setShowRates] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('All Branches');

    useEffect(() => {
        loadStats();
    }, [selectedBranch]);

    const loadStats = () => {
        setLoading(true);
        getDashboardStats(selectedBranch)
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard Error:", err);
                setError(err.message);
                setLoading(false);
            });
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-[#0a192f] text-xl font-semibold animate-pulse">Loading Analytics...</div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600">
            <h3 className="text-xl font-bold">Error Loading Dashboard</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-200 rounded">Retry</button>
        </div>
    );

    if (!stats) return null;

    // Safe Chart Data
    const chartData = [
        { name: 'Mon', bookings: 4 },
        { name: 'Tue', bookings: 7 },
        { name: 'Wed', bookings: 3 },
        { name: 'Thu', bookings: 9 },
        { name: 'Fri', bookings: 12 },
    ];

    const StatCard = ({ icon: Icon, title, value, color, bg }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
        >
            <div className={`p-4 rounded-xl ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-[#0a192f]">{value}</h3>
            </div>
        </motion.div>
    );

    const branches = ['All Branches', 'Mettupalayam', 'Thoppampatti', 'Thudiyalur', 'RS Puram', 'Headquarters', 'Main Branch'];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#0a192f]">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Overview of your courier performance</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    {/* Branch Selector */}
                    <div className="relative">
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-[#0a192f] py-2.5 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const { sendDailyReport } = await import('../services/api');
                                const res = await sendDailyReport();
                                alert(res.message || 'Report Sent!');
                            } catch (e) { alert('Failed to send report'); }
                        }}
                        className="flex items-center space-x-2 bg-white text-[#0a192f] border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
                    >
                        <Mail size={18} />
                        <span className="hidden sm:inline font-medium">Daily Report</span>
                    </button>
                    <button
                        onClick={() => exportReport(selectedBranch)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-xl hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline font-medium">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Package}
                    title="Total Bookings"
                    value={stats.totalBookings || 0}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    icon={DollarSign}
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue || 0} `}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    icon={Users}
                    title="Active Employees"
                    value="4"
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Avg. Daily"
                    value="₹1.2k"
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#0a192f]">Weekly Performance</h3>
                        <button
                            onClick={() => setShowDetails(true)}
                            className="text-sm text-red-600 font-medium flex items-center hover:underline cursor-pointer"
                        >
                            View Details <ArrowUpRight size={16} className="ml-1" />
                        </button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="bookings"
                                    fill="#0a192f"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                    activeBar={{ fill: '#3b82f6' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <div className="bg-[#0a192f] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600/30 rounded-full -ml-5 -mb-5 blur-xl"></div>

                    <h3 className="text-xl font-bold mb-4 relative z-10">Quick Actions</h3>
                    <div className="space-y-3 relative z-10">
                        <button
                            onClick={() => setShowEmployees(true)}
                            className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer border border-white/5 flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium">Manage Employees</span>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition" />
                        </button>
                        <button
                            onClick={() => setShowRates(true)}
                            className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer border border-white/5 flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium">Rate Configuration</span>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition" />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer border border-white/5 flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium">System Settings</span>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-[#0a192f]">Recent Bookings</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</th>
                                <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentBookings && stats.recentBookings.map((booking, idx) => (
                                <tr key={booking._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 text-sm font-medium text-[#0a192f]">#{booking._id?.substring(0, 8)}</td>
                                    <td className="py-4 text-sm text-gray-600">{booking.receiver?.destination || 'N/A'}</td>
                                    <td className="py-4 text-sm font-bold text-green-600">₹{booking.cost?.amount || 0}</td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                                            {booking.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm text-gray-500">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))}
                            {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                                <tr><td colSpan="5" className="py-8 text-center text-gray-400">No recent bookings found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showEmployees && <ManageEmployees onClose={() => setShowEmployees(false)} branch={selectedBranch} />}
            {showRates && <RateEditor onClose={() => setShowRates(false)} />}
            {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}

            {/* Weekly Performance Details Modal - Inline here for simplicity */}
            {showDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-[#0a192f] text-white">
                            <h2 className="text-xl font-bold">Weekly Performance Details</h2>
                            <button onClick={() => setShowDetails(false)} className="hover:bg-white/10 p-2 rounded-full transition">
                                <ArrowRight size={20} className="rotate-180" /> {/* Close Icon */}
                            </button>
                        </div>
                        <div className="p-6">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3 text-sm font-bold text-gray-500">Day</th>
                                        <th className="p-3 text-sm font-bold text-gray-500">Bookings</th>
                                        <th className="p-3 text-sm font-bold text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map((d, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-[#0a192f]">{d.name}</td>
                                            <td className="p-3 font-bold text-blue-600">{d.bookings}</td>
                                            <td className="p-3 text-xs text-green-600 font-medium">On Target</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => (
    <ErrorBoundary>
        <AdminDashboardContent />
    </ErrorBoundary>
);

export default AdminDashboard;
