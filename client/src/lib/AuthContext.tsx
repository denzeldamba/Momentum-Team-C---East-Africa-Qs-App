/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

/* ------------------------------------------------------------------ */
/* Supabase Client Configuration (Restored & Enhanced for Offline) */
/* ------------------------------------------------------------------ */
const supabase = createClient(
    "https://bnkoocieycisdixgecdt.supabase.co" ,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua29vY2lleWNpc2RpeGdlY2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTc1NDcsImV4cCI6MjA4MDMzMzU0N30.dH0OWmVnaR31qx9VaEtMT_3bCpKZ_OwWFmRJN4RLG-Y"
);

interface Message {
  message: string | null;
  type: "success" | "error" | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  loading: boolean;
  authError: string | null;
  authSuccess: boolean;
  message: Message;
  setMessage: React.Dispatch<React.SetStateAction<Message>>;
  supabase: SupabaseClient;
  theme: "light" | "dark";
  toggleTheme: () => void;
  handleLogin: (email: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleLoginTransition: (navigate: (path: string) => void) => Promise<void>;
  handleBackTransition: (navigate: (path: string) => void) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Context */
/* ------------------------------------------------------------------ */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/* ------------------------------------------------------------------ */
/* Splash Screen (Restored Triple Spinners) */
/* ------------------------------------------------------------------ */
const SplashScreen: React.FC<{ message: string; theme: "light" | "dark" }> = ({
  message,
  theme,
}) => {
  const isDark = theme === "dark";
  const bgColor = isDark ? "#09090b" : "#f9fafb";
  const textColor = isDark ? "#ffffff" : "#111827";
  const brandColor = isDark ? "#facc15" : "#ca8a04";

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-500"
    >
      <div className="relative w-16 h-16 mb-6">
        {/* Spinner 1 */}
        <div className="absolute inset-0 animate-spin border-4 border-t-yellow-500 border-r-yellow-500 border-b-transparent border-l-transparent rounded-full opacity-70 shadow-[0_0_12px_rgba(250,204,21,0.35)]" />
        {/* Spinner 2 */}
        <div
          className="absolute inset-2 animate-spin border-3 border-t-transparent border-r-transparent border-b-yellow-400 border-l-yellow-400 rounded-full opacity-90"
          style={{ animationDirection: "reverse", animationDuration: "1s" }}
        />
        {/* Spinner 3 */}
        <div
          className="absolute inset-4 animate-spin border-2 border-t-yellow-300 border-r-yellow-300 border-b-transparent border-l-transparent rounded-full opacity-80"
          style={{ animationDuration: "1.4s" }}
        />
      </div>
      <h1 style={{ color: brandColor }} className="text-2xl font-bold mb-1 tracking-wider uppercase text-center px-4">
        QS Pocket Knife
      </h1>
      <p className="text-gray-500 text-xs uppercase tracking-widest">{message}</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Provider */
/* ------------------------------------------------------------------ */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<Message>({
    message: null,
    type: null,
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ---------------- Auth Initialization ---------------- */
  useEffect(() => {
    const initializeAuth = async () => {
      // Consistent with your requested branding duration
      const timer = new Promise((resolve) => setTimeout(resolve, 2200));

      try {
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");

        if (token_hash) {
          setVerifying(true);
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "email",
          });

          if (error) {
            setAuthError(error.message);
          } else {
            window.history.replaceState({}, document.title, "/");
          }
          setVerifying(false);
        } else {
          // Check for existing session in localStorage
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } finally {
        await timer;
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginTransition = async (navigate: (path: string) => void) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    navigate("/login");
    setIsLoading(false);
  };

  const handleBackTransition = async (navigate: (path: string) => void) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    navigate("/");
    setIsLoading(false);
  };

  const handleLogin = async (email: string) => {
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setAuthError(error.message);
      toast.error(error.message);
    } else {
      setAuthSuccess(true);
      toast.success("Check your email!");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsLoading(false);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        loading,
        authError,
        authSuccess,
        message,
        setMessage,
        supabase,
        theme,
        toggleTheme,
        handleLogin,
        handleLogout,
        handleLoginTransition,
        handleBackTransition,
      }}
    >
      {isLoading ? (
        <SplashScreen
          theme={theme}
          message={verifying ? "Verifying..." : "Loading Workspace..."}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};