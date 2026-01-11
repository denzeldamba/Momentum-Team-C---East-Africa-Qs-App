/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

interface Message {
    message: string | null;
    type: 'success' | 'error' | null;
}

interface AuthContextType {
    session: Session | null;
    isLoading: boolean;     // The global gatekeeper for the SplashScreen
    loading: boolean;       // Restored: Specific for button loading states
    authError: string | null; // Restored: For the login form error display
    authSuccess: boolean;   // Restored: For success confirmation
    message: Message;
    setMessage: React.Dispatch<React.SetStateAction<Message>>;
    supabase: SupabaseClient;
    handleLogin: (email: string) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleLoginTransition: (navigate: (path: string) => void) => Promise<void>;
    handleBackTransition: (navigate: (path: string) => void) => Promise<void>; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

const SplashScreen: React.FC<{ message: string }> = ({ message }) => {
    const animationStyles = `
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spin-fast { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
.animate-spin-slow { animation: spin-slow 2s linear infinite; }
.animate-spin-fast { animation: spin-fast 1.5s reverse linear infinite; }
`;
    return (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black text-white">
            <style>{animationStyles}</style>
            <div className="relative w-16 h-16 mb-6">
                <div className="animate-spin-slow absolute inset-0 border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent rounded-full opacity-70"></div>
                <div className="animate-spin-fast absolute inset-2 border-3 border-t-transparent border-r-transparent border-b-green-400 border-l-green-400 rounded-full opacity-90"></div>
            </div>
            <h1 className="text-2xl font-bold mb-1 text-green-400 tracking-wider uppercase">QS Pocket Knife</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">{message}</p>
        </div>
    );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false); 
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState<Message>({ message: null, type: null });

    useEffect(() => {
        const initializeAuth = async () => {
            const timer = new Promise(resolve => setTimeout(resolve, 3000));
            try {
                const params = new URLSearchParams(window.location.search);
                const token_hash = params.get("token_hash");

                if (token_hash) {
                    setVerifying(true);
                    const { error } = await supabase.auth.verifyOtp({ token_hash, type: "email" });
                    if (error) setAuthError(error.message);
                    else window.history.replaceState({}, document.title, "/");
                    setVerifying(false);
                } else {
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    setSession(currentSession);
                }
            } finally {
                await timer;
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const handleLoginTransition = async (navigate: (path: string) => void) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate("/login");
        setIsLoading(false);
    };

    // Added 1.8s back transition
    const handleBackTransition = async (navigate: (path: string) => void) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));
        navigate("/");
        setIsLoading(false);
    };

    const handleLogin = async (email: string) => {
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(false);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });

        if (error) {
            setAuthError(error.message);
            toast.error(error.message);
        } else {
            setAuthSuccess(true);
            toast.success("Check your email for the login link!");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await supabase.auth.signOut();
        setSession(null);
        setIsLoading(false);
        toast.success("Logged out successfully");
    };

    if (isLoading) {
        return <SplashScreen message={verifying ? "Verifying Credentials..." : "Initializing Toolkit..."} />;
    }

    return (
        <AuthContext.Provider value={{ 
            session, isLoading, loading, authError, authSuccess, 
            message, setMessage, supabase, handleLogin, handleLogout, 
            handleLoginTransition, handleBackTransition 
        }}>
            {children}
        </AuthContext.Provider>
    );
};