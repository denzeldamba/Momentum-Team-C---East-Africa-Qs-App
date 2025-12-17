import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../Components/ui/button';
import { useNavigate } from 'react-router-dom'; 
import { Mail, CheckCircle, X } from 'lucide-react';

interface AuthMessageProps {
    message: string | null;
    type: 'success' | 'error' | null;
}

const AuthMessage: React.FC<AuthMessageProps> = ({ message, type }) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    const baseClass = "p-4 rounded-xl text-sm font-medium flex items-center space-x-3 shadow-lg";
    const msgClass = isSuccess
        ? "bg-green-700 text-white dark:bg-green-800"
        : "bg-red-700 text-white dark:bg-red-800";

    return (
        <div className={`${baseClass} ${msgClass}`}>
            {isSuccess ? <CheckCircle size={20} /> : <X size={20} />}
            <span>{message}</span>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const { handleLogin, loading, authError, authSuccess, handleBackTransition } = useAuth();
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

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
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-[0_0_40px_rgba(255,193,7,0.3)] space-y-6 border border-gray-700">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-yellow-400">QS Pocket Knife</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in for secure, **Offline-First** access to your projects.
                    </p>
                </div>

                <AuthMessage message={statusMessage} type={statusType} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email Address (Magic Link Login)
                        </label>
                        <Mail size={18} className="absolute left-3 top-9 text-gray-500" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // ADDED PLACEHOLDER BELOW
                            placeholder="example@gmail.com"
                            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-gray-800 text-white placeholder-gray-500 outline-none transition-all"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 shadow-xl transition transform hover:scale-[1.01] flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <span className="flex items-center space-x-2">
                                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></span>
                                <span>Sending Link...</span>
                            </span>
                        ) : (
                            'Send Secure Magic Link'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    <button 
                        onClick={() => handleBackTransition(navigate)}
                        className="font-medium text-blue-400 hover:text-amber-500 transition bg-transparent border-none cursor-pointer"
                    >
                        ← Back to App Description
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;