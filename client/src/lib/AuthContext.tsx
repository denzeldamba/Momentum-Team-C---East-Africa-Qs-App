import React, { useState, useEffect, useContext, createContext, type ReactNode } from "react";
import { createClient, type Session, type AuthError, type SupabaseClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

// --- Client Initialization (Using local VITE vars) ---
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

// --- Context and Hook Definitions ---
interface AuthContextType {
    session: Session | null;
    loading: boolean;
    authError: string | null;
    authSuccess: boolean;
    supabase: SupabaseClient;
    handleLogin: (email: string) => Promise<void>;
    handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the authentication context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// --- Auth Provider Component ---
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState(false);
    
    // Check for Magic Link verification in URL on load
    const params = new URLSearchParams(window.location.search);
    const hasTokenHash = params.get("token_hash");
    const [verifying, setVerifying] = useState(!!hasTokenHash);

    useEffect(() => {
        const token_hash = params.get("token_hash");
        const type = params.get("type");
        let unsubscribe: (() => void) | undefined;

        // 1. Handle Magic Link Verification (if token_hash is in the URL)
        if (token_hash) {
            supabase.auth
                .verifyOtp({
                    token_hash,
                    type: (type as "email" | "sms") || "email",
                })
                .then(({ error }: { error: AuthError | null }) => {
                    if (error) setAuthError(error.message);
                    else {
                        setAuthSuccess(true);
                        // Clean the URL to prevent verification loop
                        window.history.replaceState({}, document.title, "/");
                    }
                    setVerifying(false);
                });
        } else {
            setVerifying(false);
        }

        // 2. Initial Session Check & Real-time Listener
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        unsubscribe = subscription.unsubscribe;
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const handleLogin = async (email: string) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });

        if (error) toast.error(error.error_description || error.message);
        else setAuthSuccess(true); // Flag success after link is sent

        setLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setSession(null);
        setLoading(false);
    };

    // Render loading state for verification/initial load
    if (verifying || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <h1 className="text-3xl font-bold mb-4 text-blue-600">QS Pocket Knife</h1>
                <p className="text-gray-700 mb-2">
                    {verifying ? "Confirming magic link..." : "Initializing application..."}
                </p>
            </div>
        );
    }
    
    // Provide the session and handlers to children components
    const value = {
        session,
        loading: false, 
        authError,
        authSuccess,
        supabase,
        handleLogin,
        handleLogout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};