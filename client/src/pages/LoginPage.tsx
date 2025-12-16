import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../Components/ui/button';
import { Link } from 'react-router-dom';

interface Message {
    message: string | null;
    type: 'success' | 'error' | null;
}

// --- 1. MOVE AuthMessage OUTSIDE THE RENDER FUNCTION ---
interface AuthMessageProps {
    message: Message | { message: null, type: null }; 
}

const AuthMessage: React.FC<AuthMessageProps> = ({ message }) => {
    // Ensure 'message' structure is checked before access
    if (!message || !message.message) return null; 
    
    const baseClass = "p-3 rounded-lg text-sm mb-4";
    const msgClass = message.type === 'success' 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        
    return <div className={`${baseClass} ${msgClass}`}>{message.message}</div>;
};
// --- END AuthMessage ---

const LoginPage: React.FC = () => {
    const { handleLogin, isLoading, message, setMessage } = useAuth();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            handleLogin(email);
        } else {
            if (setMessage) {
                setMessage({ message: 'Please enter a valid email address.', type: 'error' });
            }
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign In</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your email for the secure Magic Link to log in.
                    </p>
                </div>
                
                {/* 2. Pass the message state as a prop */}
                <AuthMessage message={message} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3"
                    >
                        {isLoading ? 'Sending Link...' : 'Send Magic Link'}
                    </Button>
                </form>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        ← Back to App Description
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;