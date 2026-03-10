import React, { useState } from 'react';
import useDataStore from '../store/dataStore';
import api from '../api';
import { Plus, Users, MapPin, Hash, Building2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Clients() {
    const { clients, activeTenantId, fetchTenantData } = useDataStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        buyer_name: '', address: '', gstin: '', state_name: '', state_code: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!activeTenantId) {
            setError("Select a company workspace first");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/tenants/${activeTenantId}/clients`, formData);
            setShowForm(false);
            setFormData({ buyer_name: '', address: '', gstin: '', state_name: '', state_code: '' });
            fetchTenantData(activeTenantId); // refresh
            setSuccess('Client added successfully');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError("Failed to save client: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Client Directory</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage buyers and their GST details</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center shadow-blue-500/20 from-blue-600 to-indigo-600"
                >
                    <UserPlus size={18} className="mr-2" />
                    <span>{showForm ? 'Cancel' : 'New Client'}</span>
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start text-sm animate-fade-in">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl flex items-start text-sm animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{success}</span>
                </div>
            )}

            {showForm && (
                <div className="glass-card overflow-hidden animate-fade-in">
                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                        <h2 className="text-lg font-display font-bold text-slate-800">Register New Buyer</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business / Buyer Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Building2 size={16} /></div>
                                    <input type="text" required value={formData.buyer_name} onChange={e => setFormData({ ...formData, buyer_name: e.target.value })} className="input-field pl-10" placeholder="Acme Logistics Pvt Ltd" />
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">GSTIN</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={16} /></div>
                                    <input type="text" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} className="input-field pl-10 uppercase" placeholder="29XXXXX..." />
                                </div>
                            </div>
                            <div className="lg:col-span-2 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address *</label>
                                <div className="relative">
                                    <div className="absolute top-2.5 left-0 pl-3 pointer-events-none text-slate-400"><MapPin size={16} /></div>
                                    <textarea required rows="1" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input-field pl-10 resize-none py-2" placeholder="Street, City, Pincode..."></textarea>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State Name</label>
                                <input type="text" value={formData.state_name} onChange={e => setFormData({ ...formData, state_name: e.target.value })} className="input-field" placeholder="Karnataka" />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State Code</label>
                                <input type="text" value={formData.state_code} onChange={e => setFormData({ ...formData, state_code: e.target.value })} className="input-field" placeholder="29" />
                            </div>
                            <div className="lg:col-span-2 flex items-end justify-end space-x-3 mt-4 lg:mt-0">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto shadow-blue-500/20 from-blue-600 to-indigo-600 disabled:opacity-70">
                                    {loading ? 'Saving...' : 'Register Buyer'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Client List */}
            <div className="glass-card shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client Identity</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Address</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tax Region</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-800 text-sm md:text-base">{client.buyer_name}</div>
                                        <div className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">
                                            GSTIN: {client.gstin || 'Unregistered'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 max-w-sm line-clamp-2" title={client.address}>{client.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-800">{client.state_name || '-'}</div>
                                        <div className="text-xs text-slate-500">Code: {client.state_code || '-'}</div>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                                <Users size={32} className="text-blue-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium text-lg">Your client directory is empty</p>
                                            <p className="text-slate-400 text-sm mt-1">Add your first buyer to streamline invoicing.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
