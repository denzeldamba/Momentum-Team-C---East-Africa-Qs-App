import "./App.css";
import { AuthProvider, useAuth } from "./lib/AuthContext"; // Import the Provider and Hook
import { AuthPage } from "./pages/AuthPage"; // The login form UI (AuthPageUI, renamed here)
import AppShell from "./Components/layout/AppShell"; // The main authenticated application structure

// --- Step 1: Component responsible for rendering the correct UI based on auth state ---
const AuthGate = () => {
    // Use the hook to determine the current session status
    const { session, verifying, loading, authError, authSuccess } = useAuth();
    
    // Handle loading/verification states first
    if (verifying || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                 <p className="text-xl text-blue-500">Loading Application...</p>
            </div>
        );
    }
    
    // If the session exists, the user is logged in: render the main application shell.
    if (session) {
        // AppShell will contain the Navbar, Sidebar, and the Dashboard content
        return <AppShell session={session} />; 
    }

    // If the session does not exist, show the login form/status UI.
    return <AuthPage />;
};

// --- Step 2: Main Application Wrapper ---
function App() {
    // We wrap the entire application in the AuthProvider so the session state is accessible everywhere
    return (
        <AuthProvider>
            <AuthGate />
        </AuthProvider>
    );
}

export default App;