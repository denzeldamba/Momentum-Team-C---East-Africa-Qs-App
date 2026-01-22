import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../Components/ui/button';
import { useNavigate } from 'react-router-dom'; 
import { Mail, CheckCircle, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Sub-Component: AuthMessage */
/* ------------------------------------------------------------------ */
interface AuthMessageProps {
    message: string | null;
    type: 'success' | 'error' | null;
}

const AuthMessage: React.FC<AuthMessageProps> = ({ message, type }) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    const baseClass = "p-4 rounded-xl text-sm font-bold flex items-center space-x-3 shadow-lg border animate-in fade-in zoom-in duration-300";
    const msgClass = isSuccess
        ? "bg-green-500/10 text-green-500 border-green-500/20"
        : "bg-red-500/10 text-red-500 border-red-500/20";

    return (
        <div className={`${baseClass} ${msgClass}`}>
            {isSuccess ? <CheckCircle size={18} className="shrink-0" /> : <X size={18} className="shrink-0" />}
            <span>{message}</span>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Main Page: LoginPage */
/* ------------------------------------------------------------------ */
const LoginPage: React.FC = () => {
    const { handleLogin, loading, authError, authSuccess, handleBackTransition, session } = useAuth();
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    /**
     * LOG IN ONCE LOGIC:
     * If a session exists (even if loaded from offline cache), 
     * push the user straight to the dashboard.
     */
    useEffect(() => {
        if (session) {
            navigate('/dashboard');
        }
    }, [session, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            handleLogin(email);
        }
    };

    let statusMessage = null;
    let statusType: 'success' | 'error' | null = null;

    if (authSuccess) {
        statusMessage = "Magic Link Sent! Check your email to complete login.";
        statusType = 'success';
    } else if (authError) {
        statusMessage = authError;
        statusType = 'error';
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 font-sans">
            <div className="w-full max-w-md bg-zinc-900/40 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(245,158,11,0.1)] space-y-8 border border-zinc-800/50 backdrop-blur-xl">
                
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-amber-500 tracking-tighter uppercase italic leading-none">
                        QS Pocket Knife
                    </h2>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                        Precision Takeoff <span className="text-zinc-700">•</span> Offline Vault
                    </p>
                </div>

                <AuthMessage message={statusMessage} type={statusType} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                            Auth Identifier (Email)
                        </label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="surveyor@company.com"
                                className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white placeholder-zinc-800 outline-none focus:ring-2 ring-amber-500/30 focus:border-amber-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || authSuccess}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-7 rounded-2xl shadow-xl shadow-amber-500/5 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 uppercase text-[11px] tracking-[0.2em]"
                    >
                        {loading ? (
                             <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                <span>Verifying...</span>
                             </div>
                        ) : authSuccess ? (
                            'Link Transmitted'
                        ) : (
                            'Authorize Session'
                        )}
                    </Button>
                </form>

                <div className="pt-4 text-center">
                    <button 
                        onClick={() => handleBackTransition(navigate)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-amber-500 transition-all bg-transparent border-none cursor-pointer"
                    >
                        ← Return to Overview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;