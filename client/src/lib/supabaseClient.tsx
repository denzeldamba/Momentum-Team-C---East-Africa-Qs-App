import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

// 1. Initialize the Supabase client (Removed 'export' to fix Fast Refresh error)
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

// 2. The Auth Component logic
export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [session, setSession] = useState<Session | null>(null);

    const params = new URLSearchParams(window.location.search);
    const hasTokenHash = params.get("token_hash");

    const [verifying, setVerifying] = useState(!!hasTokenHash);
    const [authError, setAuthError] = useState<string | null>(null);
    
    // FIXED: Added 'authSuccess' back to the array so setAuthSuccess is the function
    const [authSuccess, setAuthSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (token_hash) {
            supabase.auth
                .verifyOtp({
                    token_hash,
                    type: (type as "email" | "magiclink") || "email",
                })
                .then(({ error }) => {
                    if (error) {
                        setAuthError(error.message);
                    } else {
                        setAuthSuccess(true);
                        window.history.replaceState({}, document.title, "/");
                    }
                    setVerifying(false);
                });
        }

        supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session));

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []); // Removed setAuthSuccess from dependency to keep it clean

    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });

        if (error) alert(error.message);
        else alert("Check your email for the login link!");

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    const baseContainer = "flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4";

    if (verifying) return <div className={baseContainer}><h1>Confirming...</h1></div>;
    
    if (authError) return <div className={baseContainer}><h1>Error</h1><p>{authError}</p></div>;

    if (session) {
        return (
            <div className={baseContainer}>
                <h1 className="text-3xl font-bold mb-4 text-black">Welcome!</h1>
                <p className="mb-4 text-black">Logged in as: {session.user.email}</p>
                <button className="bg-red-600 text-white px-4 py-2 rounded font-bold" onClick={handleLogout}>Sign Out</button>
            </div>
        );
    }

    return (
        <div className={baseContainer}>
            <h1 className="text-3xl font-bold mb-4 text-black">EA Quantity Surveyor</h1>
            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm border-2 border-black">
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 mb-4 rounded text-black"
                    required
                />
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
                    {loading ? "Loading..." : "Send magic link"}
                </button>
            </form>
            {authSuccess && <p className="mt-4 text-green-600 font-bold">Login Successful!</p>}
        </div>
    );
}