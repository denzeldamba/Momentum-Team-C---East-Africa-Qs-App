// src/App.tsx

import "./App.css";
import { AuthProvider, useAuth } from "./lib/AuthContext"; //Auth Context
// The MarketingPage component is the public entry point 
import MarketingPage from "./pages/MarketingPage"; 

// The LoginPage  -- the sign-in action
import LoginPage from "./pages/LoginPage"; 

import AppShell from "./Components/layout/AppShell"; // Authenticated Application Layout

// --- 1. The Protected Root Component ---
const RootComponent = () => {
    
    const { session, isLoading } = useAuth(); // Renamed 'loading' to 'isLoading' to match AuthContext

    // A: AuthContext handles initial loading and verification
    if (isLoading) {

        return null; 
    }
    
    // B: User is Logged In -> Show the App Shell (Your main MVP UI)
    if (session) {
        // Pass the session down to AppShell, where all authenticated routes will live
        return <AppShell session={session} />; 
    }
    
    // C: User is Logged Out -> Show the Public/Marketing Page (which has the links to login)
        
    return <PublicRoutes />;
}

// --- 1.1 New Component to Handle Public Routes ---
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const PublicRoutes = () => {
    return (
        <Routes>
            {/* The default entry point: The beautiful marketing page */}
            <Route path="/" element={<MarketingPage />} />
            
            {/* The dedicated sign-in form */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Fallback for any other public route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};


// --- 2. The Final App Wrapper (using AuthProvider) ---
function App() {
    // The router must wrap the component that uses the routes.
    return (
        <AuthProvider>
            <Router> {/* Router added here */}
                <RootComponent />
            </Router>
        </AuthProvider>
    );
}

export default App;