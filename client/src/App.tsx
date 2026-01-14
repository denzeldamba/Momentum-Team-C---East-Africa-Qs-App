// src/App.tsx
import "./App.css";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import MarketingPage from "./pages/MarketingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage"; 
import AppShell from "./Components/layout/AppShell";

// React Query
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

const RootComponent = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 transition-colors">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">
          Initializing Vault...
        </div>
      </div>
    );
  }

  // ✅ Authenticated users: Pass the session prop to AppShell to fix ts(2741)
  if (session) {
    return (
      <AppShell session={session}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Redirect to dashboard if they land on / or /login while logged in */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    );
  }

  // ❌ Not authenticated → public routes
  return <PublicRoutes />;
};

const PublicRoutes = () => {
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={<MarketingPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Catch-all: Send to home if trying to access deep links while logged out */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <RootComponent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;