import React, { useState, type FormEvent } from "react";
import { useAuth } from "../lib/AuthContext"; // Access the context/hook
import { LogIn } from "lucide-react";

// This component is the dedicated, unauthenticated view for login, error, and success status.
export const AuthPage: React.FC = () => {
    // Get necessary state and handlers from the context
    const { authError, authSuccess, handleLogin, loading } = useAuth();
    const [email, setEmail] = useState("");
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleLogin(email);
    };
    
    const baseContainer =
        "flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4";

    // --- State Rendering Logic ---
    
    // 1. Error state
    if (authError) {
        return (
            <div className={baseContainer}>
                <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Error</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{authError}</p>
                <button
                    onClick={() => window.location.reload()} // Simple reload to clear state and try again
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    // 2. Success state (Magic Link Sent)
    if (authSuccess) {
        return (
            <div className={baseContainer}>
                <h1 className="text-3xl font-bold mb-4 text-green-600">Link Sent!</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-2 text-center">
                    ✓ Check your email to find the secure login link.
                </p>
                <p className="text-sm text-gray-500">You may close this window after verification.</p>
            </div>
        );
    }

    // 3. Default Login Form
    return (
        <div className={baseContainer}>
            <h1 className="text-4xl font-extrabold mb-2 text-blue-600 dark:text-blue-400">QS Pocket Knife</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                Sign in via magic link to access your projects.
            </p>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl space-y-5 border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Sending Link..." : "Get Magic Link"}
                </button>
            </form>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Secure access powered by Supabase.</p>
        </div>
    );
};