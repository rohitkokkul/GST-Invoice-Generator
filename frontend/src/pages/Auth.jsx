import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLogin) {
            const res = await login(email, password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.error);
                setIsLoading(false);
            }
        } else {
            const res = await register(email, password);
            if (res.success) {
                const loginRes = await login(email, password);
                if (loginRes.success) navigate('/dashboard');
            } else {
                setError(res.error);
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-[#f8fafc] font-sans selection:bg-indigo-500 selection:text-white">
            {/* Left Side: Premium Interactive Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[55%] bg-slate-900 relative overflow-hidden">
                {/* Stunning animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0"></div>

                {/* Animated Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse z-0"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[35rem] h-[35rem] bg-violet-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse z-0" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[60%] w-[25rem] h-[25rem] bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse z-0" style={{ animationDelay: '4s' }}></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-0"></div>

                <div className="relative z-10 p-12 lg:p-16 flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-auto">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30 border border-white/10">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold text-white tracking-tight">
                            GST Invoice Pro
                        </span>
                    </div>

                    <div className="mt-auto mb-20 animate-slide-up bg-slate-900/20 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-6 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span>v2.0 Now Available</span>
                        </div>
                        <h1 className="text-5xl lg:text-5xl xl:text-6xl font-display font-bold text-white leading-[1.15] tracking-tight mb-6">
                            Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">billing experience</span>
                        </h1>
                        <p className="text-lg text-slate-300 font-light leading-relaxed max-w-xl mb-10">
                            The intelligent, cloud-native invoicing platform designed for modern Indian businesses. Simplify compliance, track inventory, and impress clients.
                        </p>

                        <div className="grid grid-cols-2 gap-6 max-w-lg">
                            <div className="flex flex-col space-y-2">
                                <div className="p-3 bg-white/5 rounded-xl w-max border border-white/10 backdrop-blur-md">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-white font-semibold flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Bank Security</h3>
                                <p className="text-slate-400 text-sm">256-bit encryption for all your financial data.</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <div className="p-3 bg-white/5 rounded-xl w-max border border-white/10 backdrop-blur-md">
                                    <Zap className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-white font-semibold flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Lightning Fast</h3>
                                <p className="text-slate-400 text-sm">Generate PDFs native to the browser smoothly.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-white/10 pt-8 mt-auto">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg z-30">JD</div>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg z-20">AK</div>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-lg z-10">RS</div>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-medium text-white shadow-sm backdrop-blur-md z-0">+2k</div>
                        </div>
                        <p>Trusted by forward-thinking companies.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 bg-white relative z-10 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] overflow-hidden">

                {/* Mobile Header */}
                <div className="lg:hidden flex justify-center items-center space-x-3 mb-10 mt-8">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                        GST Invoice Pro
                    </span>
                </div>

                <div className="w-full max-w-md mx-auto animate-fade-in relative z-20">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight mb-3">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-slate-500 text-base">
                            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your 14-day free trial today.'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-50 border border-rose-100/50 text-rose-600 p-4 rounded-xl text-sm flex items-start shadow-sm animate-slide-up">
                                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 tracking-wide mb-2">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-base text-slate-900 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-400 font-medium"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700 tracking-wide">Password</label>
                                    {isLogin && (
                                        <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-base text-slate-900 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="flex gap-2 items-start text-xs text-slate-500 leading-relaxed pt-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>By signing up, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 px-4 font-semibold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Free Account')}</span>
                            {!isLoading && <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1.5 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 text-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-sm text-slate-600 flex items-center justify-center flex-wrap gap-1">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors ml-1 focus:outline-none focus:underline"
                            >
                                {isLogin ? 'Sign up for free' : 'Log in here'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Subtle right-side decorations */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-violet-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>
            </div>
        </div>
    );
}
