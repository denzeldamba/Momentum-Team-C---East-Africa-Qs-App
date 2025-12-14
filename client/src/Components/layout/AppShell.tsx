import React from 'react';
import { type Session } from "@supabase/supabase-js";
import { LogOut, LayoutDashboard, ListPlus, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext'; // Access the context/hook
// FIX: Using the absolute path from src to eliminate relative path confusion. 
// If your build tool is capitalizing 'components', this might fix it.
import { Button } from '../../Components/ui/button'; 
// NOTE: If the above still fails, try fixing the directory name 'Components' to 'components' 
// on your file system first, and then commit the rename using Git.

// The AppShell is the main layout for authenticated users.
interface AppShellProps {
    session: Session;
}

const AppShell: React.FC<AppShellProps> = ({ session }) => {
    // FIX: Use the handleLogout from the context
    const { handleLogout } = useAuth();
    
    // Dev B Task: Implement App Shell, Nav, and Dashboard View
    
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: ListPlus, label: "Projects", href: "/projects" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            
            {/* 1. Header/Navigation Bar */}
            <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <h1 className="text-xl font-bold text-blue-600">QS Pocket Knife</h1>
                    <div className="flex items-center space-x-4">
                        
                        {/* User Info (Dev B Task) */}
                        <span className="text-sm hidden sm:inline text-gray-600 dark:text-gray-400">
                            Welcome, {session.user.email?.split('@')[0]}
                        </span>
                        
                        {/* Logout Button (Functional) */}
                        <Button 
                            onClick={handleLogout} 
                            variant="destructive" // Example Tailwind class for red button
                            className="bg-red-500 hover:bg-red-600 text-white flex items-center space-x-2"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 2. Main Layout (Sidebar + Content) */}
            <div className="flex flex-grow">
                
                {/* Sidebar - Placeholder for Project List */}
                <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 hidden md:block">
                    <nav className="space-y-2">
                        {navItems.map(item => (
                            <a 
                                key={item.label}
                                href={item.href}
                                className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>
                    <p className="mt-8 text-xs text-gray-500">Dev B: UI & PWA</p>
                </aside>

                {/* Main Content Area (Dashboard View) */}
                <main className="flex-grow p-6 md:p-10 overflow-y-auto">
                    <h2 className="text-3xl font-bold mb-6">Project Dashboard</h2>
                    {/* Placeholder for Project List (Phase 1, Task 3) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                            Dev B Task: Implement the "Project List" component here.
                        </p>
                    </div>
                </main>
            </div>

            {/* 3. Footer */}
            <footer className="w-full p-3 text-center text-xs text-gray-500 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                &copy; Momentum Labs QS MVP | Platform: Offline-First PWA
            </footer>
        </div>
    );
};

export default AppShell;