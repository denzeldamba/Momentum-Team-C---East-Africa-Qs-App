import React from 'react';
import { type Session } from "@supabase/supabase-js";
import { useLocation, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, ListPlus, Settings, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../ui/button';

interface AppShellProps {
    session: Session;
    children: React.ReactNode; // Added children to fix ts(2322)
}

const AppShell: React.FC<AppShellProps> = ({ session, children }) => {
    const { handleLogout, toggleTheme, theme, isLoading } = useAuth();
    const location = useLocation();
    
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: ListPlus, label: "Projects", href: "/projects" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    const userDisplay = session.user?.email?.split('@')[0] || "User";

    return (
        <div className="flex flex-col min-h-screen bg-main text-theme transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-theme bg-main/80 backdrop-blur-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <h1 className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent uppercase italic">
                        QS POCKET KNIFE
                    </h1>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button 
                            variant="ghost" 
                            onClick={toggleTheme}
                            className="flex items-center gap-2 text-muted hover:bg-surface rounded-full transition-all"
                        >
                            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-zinc-600" />}
                            <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] font-black">
                                {theme === 'dark' ? 'Drafting' : 'Sunlight'}
                            </span>
                        </Button>
                        
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <span className="text-xs hidden sm:inline text-muted font-bold uppercase tracking-wider">
                            {userDisplay}
                        </span>
                        
                        <Button onClick={handleLogout} variant="ghost" className="text-muted hover:text-red-500 transition-colors">
                            <LogOut size={16} className="sm:mr-2" />
                            <span className="hidden sm:inline font-bold text-xs uppercase">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex grow">
                {/* Sidebar */}
                <aside className="w-64 bg-main border-r border-theme p-6 hidden md:block">
                    <nav className="space-y-2">
                        {navItems.map(item => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link 
                                    key={item.label}
                                    to={item.href}
                                    className={`flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                            : 'text-muted hover:bg-surface hover:text-theme'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="grow p-6 md:p-10 bg-main transition-colors duration-500">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                <p className="text-amber-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Local Vault...</p>
                            </div>
                        ) : (
                            /* Render the current page (children) instead of a hardcoded Dashboard */
                            children 
                        )}
                    </div>
                </main>
            </div>

            <footer className="w-full p-4 text-center text-[9px] uppercase tracking-[0.3em] text-muted border-t border-theme bg-main">
                &copy; 2026 Momentum Labs QS MVP | Offline-First Architecture
            </footer>
        </div>
    );
};

export default AppShell;