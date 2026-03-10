import React, { useState } from 'react';
import useDataStore from '../store/dataStore';
import { Building2, Save, MapPin, Receipt, Phone, Mail, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Settings() {
    const { tenants, createTenant, activeTenantId } = useDataStore();

    const [formData, setFormData] = useState({
        company_name: '',
        gstin: '',
        address: '',
        state_name: '',
        state_code: '',
        contact: '',
        email: '',
        bank_name: '',
        bank_acc: '',
        bank_ifsc: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const res = await createTenant(formData);

        if (res.success) {
            setSuccess('Company profile registered successfully!');
            setFormData({
                company_name: '', gstin: '', address: '', state_name: '', state_code: '',
                contact: '', email: '', bank_name: '', bank_acc: '', bank_ifsc: ''
            });
            setTimeout(() => setSuccess(''), 4000);
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    const activeTenant = tenants.find(t => t.id === parseInt(activeTenantId));

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Company Settings</h1>
                <p className="text-slate-500 mt-1">Manage billing profiles and legal entities</p>
            </div>

            {/* Active Company Banner */}
            {activeTenant && (
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
                    <div className="absolute right-0 top-0 opacity-10 transform scale-150 -translate-y-8 translate-x-8">
                        <Building2 size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-md border border-white/20">Active Workspace</span>
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-2">{activeTenant.company_name}</h2>
                            <div className="flex flex-col sm:flex-row sm:space-x-6 text-indigo-100 text-sm">
                                <span className="flex items-center mt-1"><Receipt size={14} className="mr-1.5 opacity-70" /> GSTIN: {activeTenant.gstin || 'Unregistered'}</span>
                                <span className="flex items-center mt-1"><MapPin size={14} className="mr-1.5 opacity-70" /> {activeTenant.state_name || 'State pending'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 md:p-8 bg-white/40 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-800">Register New Entity</h2>
                        <p className="text-sm text-slate-500 mt-1">Add a new company/branch to your account.</p>
                    </div>
                    <div className="hidden sm:block p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Building2 size={24} />
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start text-sm">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl flex items-start text-sm">
                            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Core Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Business Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Legal Company Name *</label>
                                    <input type="text" name="company_name" required value={formData.company_name} onChange={handleChange} className="input-field" placeholder="Acme Corp Ltd." />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">GSTIN *</label>
                                    <input type="text" name="gstin" required value={formData.gstin} onChange={handleChange} className="input-field uppercase" placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registered Address *</label>
                                    <textarea name="address" required rows="2" value={formData.address} onChange={handleChange} className="input-field resize-none" placeholder="123 Business Avenue, Tech Park..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State Name</label>
                                    <input type="text" name="state_name" value={formData.state_name} onChange={handleChange} className="input-field" placeholder="Maharashtra" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State Code (GST)</label>
                                    <input type="text" name="state_code" value={formData.state_code} onChange={handleChange} className="input-field" placeholder="27" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone size={16} /></div>
                                        <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="input-field pl-10" placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Support Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={16} /></div>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="billing@acme.com" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Bank Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Banking & Payments</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Landmark size={16} /></div>
                                        <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="input-field pl-10" placeholder="HDFC Bank" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number</label>
                                    <input type="text" name="bank_acc" value={formData.bank_acc} onChange={handleChange} className="input-field font-mono" placeholder="50100XXXXXXX" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code</label>
                                    <input type="text" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleChange} className="input-field font-mono uppercase" placeholder="HDFC0001234" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                <span className="flex items-center">
                                    <Save size={18} className="mr-2" />
                                    {loading ? 'Registering Entity...' : 'Register Company Profile'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
