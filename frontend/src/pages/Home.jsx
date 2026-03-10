import React from 'react';
import useDataStore from '../store/dataStore';
import { Users, FileText, IndianRupee, TrendingUp, Building2, ExternalLink, Zap } from 'lucide-react';

export default function Home() {
    const { invoices, clients, items, activeTenantId, tenants } = useDataStore();

    const activeTenant = tenants.find(t => t.id === parseInt(activeTenantId));

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.total_tax, 0);

    const stats = [
        { name: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
        { name: 'Tax Collected', value: `₹${totalTax.toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/20' },
        { name: 'Invoices Issued', value: invoices.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-500/10', ring: 'ring-purple-500/20' },
        { name: 'Total Clients', value: clients.length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
    ];

    if (!activeTenantId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                    <Building2 className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-3 tracking-tight">Welcome to GST Invoice Pro</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    You need to create a Company Profile to unlock the dashboard and start issuing invoices.
                </p>
                <button
                    onClick={() => window.location.href = '/dashboard/settings'}
                    className="btn-primary flex items-center space-x-2 text-lg px-8 py-3"
                >
                    <Building2 size={20} />
                    <span>Setup Company Profile</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Greeting Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Hello, {activeTenant?.company_name}</h1>
                    <p className="text-slate-500 mt-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => window.location.href = '/dashboard/invoices'} className="btn-primary text-sm flex items-center">
                        <FileText size={16} className="mr-2" /> New Invoice
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.name}
                        className="glass-card p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} ring-1 ${stat.ring} shadow-sm`}>
                                    <stat.icon size={22} strokeWidth={2.5} />
                                </div>
                                <span className="text-emerald-500 flex items-center text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                    +12% <TrendingUp size={12} className="ml-1" />
                                </span>
                            </div>
                            <div>
                                <p className="text-3xl font-display font-bold text-slate-800 tracking-tight mb-1">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices Column */}
                <div className="lg:col-span-2 glass-card p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-display font-bold text-slate-800">Recent Invoices</h2>
                        <button onClick={() => window.location.href = '/dashboard/invoices'} className="text-sm font-semibold text-indigo-600 flex items-center hover:text-indigo-700">
                            View All <ExternalLink size={14} className="ml-1" />
                        </button>
                    </div>

                    {invoices.length > 0 ? (
                        <div className="space-y-3">
                            {invoices.slice(0, 5).map(inv => {
                                const client = clients.find(c => c.id === inv.client_id);
                                return (
                                    <div key={inv.id} className="group flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm border border-indigo-100/50">
                                                {inv.invoice_no.split('-')[1] || inv.invoice_no.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{inv.invoice_no}</p>
                                                <p className="text-sm text-slate-500">{client?.buyer_name || 'Walk-in Client'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">₹{(inv.total_amount + inv.total_tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">{new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <FileText size={48} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium">No invoices generated yet.</p>
                        </div>
                    )}
                </div>

                {/* System Activity & Inventory */}
                <div className="space-y-8">
                    <div className="glass-card p-6 md:p-8">
                        <h2 className="text-lg font-display font-bold text-slate-800 mb-6">Inventory Status</h2>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                                <div className="text-xl font-bold text-indigo-600">{items.length}</div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700">Active Products</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">System is tracking {items.length} mapped products / services for fast invoicing.</p>
                            </div>
                        </div>
                        <button onClick={() => window.location.href = '/dashboard/items'} className="w-full mt-6 btn-secondary text-sm">
                            Manage Catalog
                        </button>
                    </div>

                    <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-indigo-600 to-violet-700 border-none shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Zap size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-display font-bold mb-2">Need Help?</h2>
                            <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                                Our support engineers are available 24/7 to assist you with GST migrations and data mapping.
                            </p>
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
