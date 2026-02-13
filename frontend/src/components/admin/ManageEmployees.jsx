import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee } from '../../services/api';
import { UserPlus, X, User } from 'lucide-react';

const ManageEmployees = ({ onClose, branch }) => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ username: '', password: '', branch: (branch && branch !== 'All Branches') ? branch : '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployees();
    }, [branch]);

    const loadEmployees = () => {
        getEmployees(branch).then(data => {
            setEmployees(data);
            setLoading(false);
        }).catch(console.error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createEmployee(formData);
            if (res.error) return alert(res.error);
            alert('Employee Created!');
            setFormData({ username: '', password: '', branch: '' });
            loadEmployees();
        } catch (err) {
            alert('Failed to create employee');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-[#0a192f] text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus size={20} /> Manage Employees
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Add Form */}
                    <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-[#0a192f] mb-4">Add New Employee</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text" placeholder="Username" required
                                className="p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Password" required
                                className="p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Branch Name" required
                                className="p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium w-full md:w-auto">
                            Create Employee
                        </button>
                    </form>

                    {/* Employee List */}
                    <h3 className="font-bold text-[#0a192f] mb-4">Existing Employees ({employees.length})</h3>
                    <div className="space-y-3">
                        {loading ? <p>Loading...</p> : employees.map(emp => (
                            <div key={emp._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={20} /></div>
                                    <div>
                                        <p className="font-bold text-gray-800">{emp.username}</p>
                                        <p className="text-sm text-gray-500">{emp.branch}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                            </div>
                        ))}
                        {employees.length === 0 && !loading && <p className="text-gray-500 text-center py-4">No employees found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageEmployees;
