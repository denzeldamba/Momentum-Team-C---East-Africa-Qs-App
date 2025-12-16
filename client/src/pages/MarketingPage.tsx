import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LayoutGrid, Zap, MapPin, Tablet, DollarSign } from 'lucide-react';

// Placeholder image URL for the hero section background
const HERO_BG_IMAGE_URL = './assets/image.jpg'; 

// --- Navigation Bar Component ---
const NavigationBar: React.FC = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:px-8 bg-blue-900/80 backdrop-blur-sm shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
            <h1 className="text-2xl font-extrabold text-white">
                <Link to="/" className="hover:text-blue-300 transition">QS Pocket Knife</Link>
            </h1>
            <div className="flex items-center space-x-4 sm:space-x-6 font-semibold">
                {/* Scroll Links (Hidden on small mobile screens for cleaner header) */}
                <div className="hidden md:flex space-x-6">
                    <Link to="/#how-it-works" className="hover:text-blue-300 transition">How It Works</Link>
                    <Link to="/#features" className="hover:text-blue-300 transition">Features</Link>
                </div>
                
                {/* Auth Buttons */}
                <Link to="/login" className="flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-white/50 rounded-lg hover:bg-blue-700 transition text-sm">
                    <LogIn size={16} className="mr-1 hidden sm:inline" /> Sign In
                </Link>
                <Link to="/login" className="bg-amber-500 text-gray-900 px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-amber-400 transition text-sm font-bold">
                    Get Started
                </Link>
            </div>
        </div>
    </nav>
);
// --- End Navigation Bar Component ---


const MarketingPage: React.FC = () => {
    const location = useLocation();
    
    // Anchor scrolling logic (copied from your template, crucial for the UX)
    const NAVBAR_HEIGHT_OFFSET = 90; 
    
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    const yOffset = -NAVBAR_HEIGHT_OFFSET;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }, 0);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    return (
        <div className="min-h-full bg-white dark:bg-gray-900">
            <NavigationBar />

            {/* --- 1. Hero Section --- */}
            <header 
                className="relative min-h-screen flex items-center justify-center text-white text-center"
                style={{ height: '100vh', backgroundImage: `url('${HERO_BG_IMAGE_URL}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-blue-900/70"></div> 

                <div className="relative z-10 pt-30 pb-12 px-6 max-w-5xl mx-auto">
                    <p className="text-base uppercase tracking-widest text-blue-300 mb-2 font-semibold">
                        The Essential Mobile Toolkit for Quantity Surveyors
                    </p>
                    <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 leading-tight">
                        Accurate BoQs, <br className="sm:hidden" /> <span className="text-amber-400">Offline & On-Site.</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto font-light">
                        Overcome high costs and outdated standards. Get precise measurements, local rates, and compliant documents—all designed for East African sites and unreliable connectivity.
                    </p>
                    
                    <Link 
                        to="/login" 
                        className="inline-block bg-amber-500 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:bg-amber-400 transition transform hover:scale-[1.02] w-full sm:w-auto"
                    >
                        Start Your 14-Day Free Trial
                    </Link>
                    <p className="mt-4 text-sm text-blue-200">No credit card required. Installs on any device as a PWA.</p>
                </div>
            </header>

            {/* --- 2. How It Works Section (Adapted from QS Roles) --- */}
            <section id="how-it-works" className="py-20 sm:py-24 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 text-center mb-16">
                        Measure. Estimate. Certify.
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <FeatureCard 
                            icon={Tablet} 
                            title="1. Mobile Digital Takeoff" 
                            description="Use your phone/tablet on-site to measure areas, volumes, and distances. Syncs instantly when you find a signal."
                        />
                        <FeatureCard 
                            icon={LayoutGrid} 
                            title="2. Localized BoQ Generation" 
                            description="Automatically generate structured Bills of Quantities and Schedules compliant with East African SMM/PPRA requirements."
                        />
                        <FeatureCard 
                            icon={DollarSign} 
                            title="3. Interim Valuation Tools" 
                            description="Quickly certify contractor payments and track financial progress against the budget directly from the site."
                        />
                    </div>
                </div>
            </section>

            {/* --- 3. Features / Why Us Section (Focus on Problem/Solution) --- */}
            <section id="features" className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-4">
                        Why Switch from Excel?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                        Your practice demands accuracy and mobility. Existing software is too expensive and complex.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        <ValuePropCard 
                            icon={Zap} 
                            title="Offline-First PWA" 
                            description="Core functions (measurement, data entry) work perfectly in remote areas with zero connectivity. Sync happens automatically later."
                        />
                        <ValuePropCard 
                            icon={MapPin} 
                            title="Built for East Africa" 
                            description="Preloaded with templates for local SMM, Standard Specifications for road/bridge works, and PPRA documentation."
                        />
                        <ValuePropCard 
                            icon={DollarSign} 
                            title="Affordable & Scalable" 
                            description="Designed for local QS firms and contractors. Pricing is transparent and accessible, unlike expensive international licenses."
                        />
                        <ValuePropCard 
                            icon={LayoutGrid} 
                            title="Automated Resource Planning" 
                            description="Generate material schedules and automatic breakdowns for concrete, mortar, and asphalt mixes to avoid site wastage."
                        />
                        <ValuePropCard 
                            icon={Tablet} 
                            title="Mobile Site Measurement" 
                            description="Utilize GPS and camera tools on your existing mobile device for quick, accurate site takeoffs, replacing paper notes."
                        />
                        <ValuePropCard 
                            icon={LogIn} 
                            title="Simple to Learn & Use" 
                            description="A dedicated focus on a streamlined UX, avoiding the complex, feature-bloated interfaces of legacy QS software."
                        />
                    </div>
                </div>
            </section>
            
            {/* Final CTA */}
            <section id="final-cta" className="py-16 bg-blue-600 text-white text-center">
                <h2 className="text-3xl font-extrabold mb-4">Ready to Modernize Your QS Practice?</h2>
                <p className="text-lg mb-8">Get the power of a dedicated tool at a fraction of the cost.</p>
                <Link 
                    to="/login" 
                    className="inline-block py-3 px-10 bg-amber-500 text-gray-900 font-semibold rounded-lg text-lg hover:bg-yellow-400 transition"
                >
                    Create Your Account Now
                </Link>
            </section>

            <footer className="w-full p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800">
                &copy; {new Date().getFullYear()} QS Pocket Knife | Developed for the East African Market.
            </footer>
        </div>
    );
};

export default MarketingPage;

// --- Helper Components for Cleanliness ---

interface FeatureCardProps { icon: React.ElementType, title: string, description: string }
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-t-4 border-amber-400 hover:shadow-2xl transition transform hover:scale-[1.01]">
        <Icon size={32} className="text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
);

interface ValuePropCardProps { icon: React.ElementType, title: string, description: string }
const ValuePropCard: React.FC<ValuePropCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition flex flex-col items-start space-y-3">
        <Icon size={24} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
);