import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Box, FileText, Settings, LogOut, Building2, Zap, Menu, X, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useDataStore from '../store/dataStore';

function Sidebar({ isMobileOpen, setIsMobileOpen }) {
    const { logout } = useAuthStore();
    const { tenants, activeTenantId, setActiveTenant } = useDataStore();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Invoices', path: '/dashboard/invoices', icon: <FileText size={20} /> },
        { name: 'Clients Map', path: '/dashboard/clients', icon: <Users size={20} /> },
        { name: 'Product Catalog', path: '/dashboard/items', icon: <Box size={20} /> },
        { name: 'Company Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    const activeTenant = tenants.find(t => t.id === parseInt(activeTenantId));

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            {/* Sidebar Content */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 shadow-2xl print:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand Header */}
                <div className="h-20 flex items-center px-6 border-b border-white/5 space-x-3 bg-gradient-to-r from-transparent to-white/[0.02]">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold text-white tracking-tight">GST Invoice Pro</span>
                </div>

                {/* Tenant Switcher Module */}
                <div className="p-5 border-b border-white/5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                        Active Workspace
                    </label>
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 size={16} className="text-indigo-400 group-focus-within:text-white transition-colors" />
                        </div>
                        <select
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-8 text-sm text-slate-200 outline-none appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-800 cursor-pointer shadow-sm"
                            value={activeTenantId || ''}
                            onChange={(e) => setActiveTenant(e.target.value)}
                        >
                            {tenants.map(t => (
                                <option key={t.id} value={t.id} className="bg-slate-800">{t.company_name}</option>
                            ))}
                            {tenants.length === 0 && <option value="">Setup a Company</option>}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <button
                        className="w-full mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between group py-1.5 px-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                        onClick={() => { window.location.href = '/dashboard/settings'; setIsMobileOpen(false); }}
                    >
                        <span>+ Add New Workspace</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1.5 custom-scrollbar">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3 mt-2">
                        Main Menu
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-300 shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`
                            }
                        >
                            <span className={`transition-transform duration-200 ${item.path === '/dashboard' ? 'group-hover:scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            U
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">Administrator</p>
                            <p className="text-xs text-slate-500 truncate">{activeTenant?.company_name || 'System'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center space-x-2 w-full px-3 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Secure Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default function DashboardLayout() {
    const { fetchTenants, activeTenantId, fetchTenantData } = useDataStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    useEffect(() => {
        if (activeTenantId) {
            fetchTenantData(activeTenantId);
        }
    }, [activeTenantId, fetchTenantData]);

    // Derive page title from route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Overview';
        if (path.includes('invoices')) return 'Invoices';
        if (path.includes('clients')) return 'Client Directory';
        if (path.includes('items')) return 'Product Matrix';
        if (path.includes('settings')) return 'Settings';
        return 'Dashboard';
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-30 shadow-sm print:hidden">
                    <div className="flex items-center">
                        <button
                            className="lg:hidden p-2 -ml-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl md:text-2xl font-display font-semibold text-slate-800 tracking-tight">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold ring-1 ring-inset ring-emerald-600/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            Live Sync
                        </span>
                    </div>
                </header>

                {/* Main Content Viewport */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth print:overflow-visible">
                    <div className="p-6 md:p-8 lg:px-10 max-w-7xl mx-auto animate-fade-in w-full pb-20 print:p-0 print:max-w-none print:pb-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
