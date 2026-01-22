import  { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    Zap,
    MapPin,
    Tablet,
    DollarSign,
    CheckCircle,
    LayoutGrid,
    Sun,
    Moon,
    Wifi,
    WifiOff,
    type LucideIcon,
} from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { useAuth } from "../lib/AuthContext";

const HERO_BG_IMAGE_URL = "../src/assets/image.jpg";

/* ======================================================
    REUSABLE COMPONENTS
   ====================================================== */

interface CardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: CardProps) => (
    <div className="p-6 bg-surface-2 rounded-xl border border-theme shadow-lg transition hover:shadow-xl text-center group">
        <Icon size={32} className="text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
);

const ValuePropCard = ({ icon: Icon, title, description }: CardProps) => (
    <div className="p-6 bg-surface-2 rounded-lg border border-theme shadow-md transition hover:shadow-xl space-y-3">
        <Icon size={24} className="text-yellow-500" />
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
);

/* ======================================================
    NAVIGATION BAR (WITH OFFLINE AWARENESS)
   ====================================================== */

const NavigationBar = () => {
    const navigate = useNavigate();
    const { toggleTheme, theme } = useAuth();
    
    // Offline Architecture: Network Listener
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener("online", handleStatus);
        window.addEventListener("offline", handleStatus);
        return () => {
            window.removeEventListener("online", handleStatus);
            window.removeEventListener("offline", handleStatus);
        };
    }, []);

    const scrollWithDelay = (id: string) => {
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 250);
    };

    return (
        <nav
            className={`
                fixed top-0 inset-x-0 z-50
                border-b border-theme
                transition-all duration-300
                ${theme === "dark" ? "bg-surface-1/85 backdrop-blur-md" : "bg-surface-1"}
            `}
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-xl sm:text-2xl font-extrabold text-yellow-500 tracking-tight">
                        QS Pocket Knife
                    </Link>

                    {/* Network Status Badge */}
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all duration-500 ${
                        isOnline 
                            ? "bg-green-500/10 border-green-500/20 text-green-500" 
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 animate-pulse"
                    }`}>
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span className="hidden lg:inline uppercase tracking-widest">
                            {isOnline ? "Cloud Active" : "Local Mode"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 font-semibold">
                    <div className="hidden md:flex gap-6 text-sm">
                        <button
                            onClick={() => scrollWithDelay("how-it-works")}
                            className="hover:text-yellow-500 transition"
                            type="button"
                        >
                            How It Works
                        </button>
                        <button
                            onClick={() => scrollWithDelay("features")}
                            className="hover:text-yellow-500 transition"
                            type="button"
                        >
                            Why Us
                        </button>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-surface-2 border border-theme hover:ring-2 ring-yellow-500 transition"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        type="button"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="border border-yellow-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-yellow-500 text-xs sm:text-sm"
                        type="button"
                    >
                        Sign In
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="bg-yellow-500 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow-lg hover:bg-yellow-400 transition"
                        type="button"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};

/* ======================================================
    TRUST & SOCIAL PROOF SECTION
   ====================================================== */

const TrustSection = () => (
    <section className="py-16 px-6 bg-surface-2 border-t border-theme">
        <div className="max-w-7xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
                Trusted by Quantity Surveyors Across East Africa
            </h2>

            <p className="text-muted max-w-3xl mx-auto">
                Used by professionals across infrastructure, commercial, and residential projects to ensure accuracy and profitability.
            </p>

            <div className="flex justify-center items-center gap-12 flex-wrap opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-12 w-32 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center font-bold text-yellow-600 dark:text-yellow-500">
                    RICS Standards
                </div>
                <div className="h-12 w-32 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center font-bold text-yellow-600 dark:text-yellow-500">
                    CIOB Methods
                </div>
                <div className="h-12 w-32 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center font-bold text-yellow-600 dark:text-yellow-500">
                    PPRA Ready
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 mt-12 text-left">
                <blockquote className="italic text-sm sm:text-base text-muted border-l-4 border-yellow-500 pl-6 py-2">
                    "QS Pocket Knife revolutionized how we manage site measurements and valuations. Accurate, fast, and easy to use even when signal is non-existent."
                    <footer className="mt-2 font-semibold text-yellow-500">— Jane Mwangi, Chartered Surveyor</footer>
                </blockquote>
                <blockquote className="italic text-sm sm:text-base text-muted border-l-4 border-yellow-500 pl-6 py-2">
                    "The integration with local standards saved us weeks of compliance headaches. Finally, a tool built for our specific market."
                    <footer className="mt-2 font-semibold text-yellow-500">— Michael Otieno, Project Manager</footer>
                </blockquote>
            </div>
        </div>
    </section>
);

/* ======================================================
    MAIN PAGE COMPONENT
   ====================================================== */

const MarketingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useAuth();

    useEffect(() => {
        if (location.hash) {
            setTimeout(() => {
                const el = document.getElementById(location.hash.substring(1));
                el?.scrollIntoView({ behavior: "smooth" });
            }, 250);
        } else {
            window.scrollTo({ top: 0 });
        }
    }, [location]);

    const typingWords = [
        "Real-Time Cost Control for Every Build.",
        "Automate Your Bills of Quantities in Minutes.",
        "Local SMM Compliance.",
        "Offline Site Takeoffs.",
    ];

    return (
        <main className="min-h-screen bg-surface-1 transition-colors selection:bg-yellow-500 selection:text-black">
            <NavigationBar />

            {/* HERO SECTION */}
            <header
                className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden"
                style={{
                    backgroundImage: `url('${HERO_BG_IMAGE_URL}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Theme-aware Overlays */}
                {theme === "light" && <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />}
                {theme === "dark" && <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />}

                <div className="relative z-10 pt-28 pb-12 max-w-5xl mx-auto">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-yellow-500 mb-4 font-bold drop-shadow-sm">
                        The Essential Mobile Toolkit for Quantity Surveyors
                    </p>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight text-theme">
                        <span className="block h-24 sm:h-32 md:h-48 mb-4 sm:mb-6">
                            <Typewriter
                                words={typingWords}
                                loop
                                cursor
                                cursorStyle="_"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1500}
                            />
                        </span>
                        <span className="block drop-shadow-lg">Delivered On-Site.</span>
                    </h1>

                    <p className="text-base sm:text-xl mb-12 max-w-3xl mx-auto font-medium text-muted drop-shadow-sm">
                        Automate takeoffs, Bills of Quantities, and valuations — fully compliant with local SMM standards, even in the most remote areas.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="bg-yellow-500 text-black font-bold py-4 px-12 rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transition transform hover:scale-[1.05] active:scale-95"
                        type="button"
                    >
                        Start Your Free Trial →
                    </button>
                </div>
            </header>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-24 px-6 bg-surface-2 border-t border-theme">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-16 tracking-tight">
                        Measure. <span className="text-yellow-500">Estimate.</span> Certify.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={Tablet}
                            title="1. Mobile Digital Takeoff"
                            description="Measure areas and volumes directly on-site using your tablet or phone. Works perfectly offline."
                        />
                        <FeatureCard
                            icon={LayoutGrid}
                            title="2. Localized BoQ Generation"
                            description="Generate SMM-compliant Bills of Quantities automatically from your site measurements."
                        />
                        <FeatureCard
                            icon={DollarSign}
                            title="3. Interim Valuations"
                            description="Certify contractor payments and track financial progress against the master budget instantly."
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-24 px-6 bg-surface-1">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 tracking-tight">
                        Professional Tools, Built for the Field.
                    </h2>

                    <p className="text-muted text-center mb-16 max-w-2xl mx-auto">
                        Your practice demands accuracy and mobility. We've stripped the bloat of legacy software to give you exactly what you need on-site.
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ValuePropCard
                            icon={Zap}
                            title="Offline-First PWA"
                            description="Deep basement or remote rural site? Your data stays safe and syncs when you find signal."
                        />
                        <ValuePropCard
                            icon={MapPin}
                            title="Built for East Africa"
                            description="Templates aligned with local Road, Bridge, and Building standards used in Kenya, Uganda, and Tanzania."
                        />
                        <ValuePropCard
                            icon={DollarSign}
                            title="Affordable & Scalable"
                            description="Local pricing models designed for small to medium QS firms, not enterprise-only budgets."
                        />
                        <ValuePropCard
                            icon={LayoutGrid}
                            title="Resource Planning"
                            description="Automatically generate labor and material breakdowns based on your takeoff data."
                        />
                        <ValuePropCard
                            icon={Tablet}
                            title="GPS Site Takeoffs"
                            description="Attach GPS coordinates and site photos directly to your measurements for indisputable records."
                        />
                        <ValuePropCard
                            icon={CheckCircle}
                            title="Simple UX"
                            description="A clean, drafting-inspired interface that feels natural to a surveyor, not an IT specialist."
                        />
                    </div>
                </div>
            </section>

            {/* TRUST & SOCIAL PROOF */}
            <TrustSection />

            {/* FOOTER */}
            <footer className="py-16 text-center text-sm text-muted bg-surface-2 border-t border-theme">
                <div className="mb-4 text-yellow-500 font-bold tracking-[0.4em] uppercase">
                    QS Pocket Knife
                </div>
                <div className="space-y-2 opacity-80">
                    <p>© {new Date().getFullYear()} Developed for the East African Construction Market.</p>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">
                        Accuracy • Integrity • Innovation
                    </p>
                </div>
            </footer>
        </main>
    );
};

export default MarketingPage;