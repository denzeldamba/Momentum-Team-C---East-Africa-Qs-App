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
    isLoading: boolean;
    loading: boolean;
    authError: string | null;
    authSuccess: boolean;
    message: Message;
    setMessage: React.Dispatch<React.SetStateAction<Message>>;
    supabase: SupabaseClient;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    handleLogin: (email: string) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleLoginTransition: (navigate: (path: string) => void) => Promise<void>;
    handleBackTransition: (navigate: (path: string) => void) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

const SplashScreen: React.FC<{ message: string, theme: string }> = ({ message, theme }) => {
    // Determine background color based on theme
    const bgColor = theme === 'dark' ? '#000000' : '#f9fafb';
    const textColor = theme === 'dark' ? '#ffffff' : '#111827';
    const brandColor = theme === 'dark' ? '#facc15' : '#ca8a04'; // Yellow-400 vs Yellow-600

    return (
        <div 
            style={{ backgroundColor: bgColor, color: textColor }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-500"
        >
            <div className="relative w-16 h-16 mb-6">
                <div className="animate-spin absolute inset-0 border-4 border-t-yellow-500 border-r-yellow-500 border-b-transparent border-l-transparent rounded-full opacity-70"></div>
                <div className="animate-spin absolute inset-2 border-3 border-t-transparent border-r-transparent border-b-yellow-400 border-l-yellow-400 rounded-full opacity-90" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <h1 style={{ color: brandColor }} className="text-2xl font-bold mb-1 tracking-wider uppercase">
                QS Pocket Knife
            </h1>
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
    
    // 1. Initialize theme from localStorage
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved === 'dark' || saved === 'light') ? saved : 'light';
    });

    // 2. This function toggles the state
    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // 3. This effect pushes the change to the actual HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const initializeAuth = async () => {
            const timer = new Promise(resolve => setTimeout(resolve, 2500));
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate("/login");
        setIsLoading(false);
    };

    const handleBackTransition = async (navigate: (path: string) => void) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
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
            toast.success("Check your email!");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await supabase.auth.signOut();
        setSession(null);
        setIsLoading(false);
        toast.success("Logged out");
    };

    if (isLoading) {
        return <SplashScreen theme={theme} message={verifying ? "Verifying..." : "Loading Workspace..."} />;
    }

    return (
        <AuthContext.Provider value={{ 
            session, isLoading, loading, authError, authSuccess, 
            message, setMessage, supabase, theme, toggleTheme,
            handleLogin, handleLogout, handleLoginTransition, handleBackTransition 
        }}>
            {children}
        </AuthContext.Provider>
    );
};