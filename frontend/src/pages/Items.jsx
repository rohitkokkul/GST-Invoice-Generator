import React, { useState } from 'react';
import useDataStore from '../store/dataStore';
import api from '../api';
import { Plus, Box, PackagePlus, Hash, IndianRupee, Percent, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Items() {
    const { items, activeTenantId, fetchTenantData } = useDataStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        particulars: '', hsn_sac: '', rate: '', gst_rate: '', per: 'Nos'
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
        // Convert string inputs to floats
        const dataToSubmit = {
            ...formData,
            rate: parseFloat(formData.rate),
            gst_rate: parseFloat(formData.gst_rate)
        };

        try {
            await api.post(`/tenants/${activeTenantId}/items`, dataToSubmit);
            setShowForm(false);
            setFormData({ particulars: '', hsn_sac: '', rate: '', gst_rate: '', per: 'Nos' });
            fetchTenantData(activeTenantId);
            setSuccess('Product mapping saved successfully');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError("Failed to save item: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                        <Box size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Product Matrix</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Standardize your inventory and pricing models</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center shadow-emerald-500/20 from-emerald-600 to-teal-600"
                >
                    <PackagePlus size={18} className="mr-2" />
                    <span>{showForm ? 'Cancel' : 'Add Item'}</span>
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
                        <h2 className="text-lg font-display font-bold text-slate-800">New Product Definition</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Particulars (Item Name) *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Box size={16} /></div>
                                    <input type="text" required value={formData.particulars} onChange={e => setFormData({ ...formData, particulars: e.target.value })} className="input-field pl-10" placeholder="e.g., Premium Web Hosting" />
                                </div>
                            </div>
                            <div className="lg:col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">HSN / SAC Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={16} /></div>
                                    <input type="text" value={formData.hsn_sac} onChange={e => setFormData({ ...formData, hsn_sac: e.target.value })} className="input-field pl-10" placeholder="998311" />
                                </div>
                            </div>
                            <div className="lg:col-span-1 md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit (Per) *</label>
                                <input type="text" required value={formData.per} onChange={e => setFormData({ ...formData, per: e.target.value })} className="input-field" placeholder="Nos, Kg, Ltr" />
                            </div>

                            <div className="lg:col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Standard Rate (Exclusive Tax) *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IndianRupee size={16} /></div>
                                    <input type="number" step="0.01" required value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} className="input-field pl-10 font-mono" placeholder="1000.00" />
                                </div>
                            </div>
                            <div className="lg:col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Applicable GST Rate (%) *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Percent size={16} /></div>
                                    <input type="number" step="0.1" required value={formData.gst_rate} onChange={e => setFormData({ ...formData, gst_rate: e.target.value })} className="input-field pl-10 font-mono" placeholder="18" />
                                </div>
                            </div>

                            <div className="lg:col-span-2 flex items-end justify-end space-x-3 mt-4 lg:mt-0">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto shadow-emerald-500/20 from-emerald-600 to-teal-600 disabled:opacity-70">
                                    {loading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Item List */}
            <div className="glass-card shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Particulars</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">HSN/SAC</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Rate (Unit)</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-emerald-600 uppercase tracking-wider">GST %</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800 text-sm md:text-base">{item.particulars}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">
                                            {item.hsn_sac || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm font-semibold text-slate-800">
                                            ₹{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">
                                            per {item.per}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="inline-flex items-center justify-end px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            {item.gst_rate}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                                <Box size={32} className="text-emerald-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium text-lg">Product matrix is empty</p>
                                            <p className="text-slate-400 text-sm mt-1">Pre-fill items here to generate invoices 10x faster.</p>
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
