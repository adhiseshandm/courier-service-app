import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { getDashboardStats } from '../services/api';
import { DollarSign, Package, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[50vh]">
            <div className="text-gray-500 animate-pulse text-xl font-semibold">Loading Analytics...</div>
        </div>
    );
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!stats) return null;

    // Data for charts (safeguard against undefined)
    const revenueData = stats.charts?.revenueTrend || [];
    const serviceData = stats.charts?.serviceDistribution || [];
    const branchData = stats.charts?.branchPerformance || [];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-[#0a192f] dark:text-white">CEO Dashboard Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
                    icon={<DollarSign size={24} />}
                    color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                />
                <KPICard
                    title="Total Bookings"
                    value={stats.totalBookings || 0}
                    icon={<Package size={24} />}
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                />
                <KPICard
                    title="Avg. Order Value"
                    value={`₹${stats.totalBookings ? Math.round(stats.totalRevenue / stats.totalBookings) : 0}`}
                    icon={<TrendingUp size={24} />}
                    color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                />
                <KPICard
                    title="Recent Activity"
                    value={`${stats.recentBookings?.length || 0} New`}
                    icon={<Users size={24} />}
                    color="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                    label="Last 5 Bookings"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Revenue Trend */}
                <ChartCard title="Revenue Trend (7 Days)">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Service Distribution */}
                <ChartCard title="Service Type Distribution">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Branch Performance */}
                <div className="lg:col-span-2">
                    <ChartCard title="Top Branches by Revenue">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon, color, label }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
            {label && <p className="text-xs text-gray-400 mt-1">{label}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-sm`}>
            {icon}
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">{title}</h3>
        <div className="flex-1 w-full min-h-0">
            {children}
        </div>
    </div>
);

export default Dashboard;
