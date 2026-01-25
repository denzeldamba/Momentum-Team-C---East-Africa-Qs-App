// src/App.tsx
import "./App.css";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import MarketingPage from "./pages/MarketingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage"; 
import AppShell from "./Components/layout/AppShell";
import ProjectDetailPage from "./pages/ProjectDetailPage"

// Hooks & Sync
import { useSync } from "./hooks/useSync"; // Import the new hook

// React Query
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

const RootComponent = () => {
  const { session, isLoading } = useAuth();

  // ✅ Initialize the background sync engine
  // This hook handles the logic of checking if the user is logged in internally
  useSync();

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

  if (session) {
    return (
      <AppShell session={session}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    );
  }

  return <PublicRoutes />;
};

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/login" element={<LoginPage />} />
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