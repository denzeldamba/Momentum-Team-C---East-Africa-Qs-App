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
    message: Message;
    setMessage: React.Dispatch<React.SetStateAction<Message>>;
    supabase: SupabaseClient;
    handleLogin: (email: string) => Promise<void>;
    handleLogout: () => Promise<void>;
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
            <h1 className="text-2xl font-bold mb-1 text-green-400 tracking-wider">QS POCKET KNIFE</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">{message}</p>
        </div>
    );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState<Message>({ message: null, type: null });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");

        const initializeAuth = async () => {
            // 3-SECOND DELAY FOR THE BRANDED EXPERIENCE ---
            const timer = new Promise(resolve => setTimeout(resolve, 3000));

            try {
                if (token_hash) {
                    setVerifying(true);
                    const { error } = await supabase.auth.verifyOtp({ token_hash, type: "email" });
                    if (error) setMessage({ message: error.message, type: 'error' });
                    else window.history.replaceState({}, document.title, "/");
                    setVerifying(false);
                } else {
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    setSession(currentSession);
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                // Wait until the 3 seconds are up before hiding the splash screen
                await timer;
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            // We don't trigger setIsLoading(false) here to avoid cutting the 3s timer short
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (email: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });
        if (error) setMessage({ message: error.message, type: 'error' });
        else setMessage({ message: "Check your email!", type: 'success' });
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        toast.success("Logged out");
    };

    if (isLoading) {
        return <SplashScreen message={verifying ? "Verifying access..." : "Initializing application..."} />;
    }

    return (
        <AuthContext.Provider value={{ session, isLoading, message, setMessage, supabase, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};