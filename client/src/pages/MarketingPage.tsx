import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, MapPin, Tablet, DollarSign, CheckCircle, LayoutGrid, Sun, Moon } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter'; 
import { useAuth } from '../lib/AuthContext';

const HERO_BG_IMAGE_URL = '../src/assets/image.jpg'; 

// --- Helper Components ---
interface FeatureCardProps { icon: React.ElementType, title: string, description: string }
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-yellow-500 hover:shadow-2xl transition transform hover:scale-[1.01] text-center border dark:border-gray-700">
        <Icon size={32} className="text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
);

interface ValuePropCardProps { icon: React.ElementType, title: string, description: string }
const ValuePropCard: React.FC<ValuePropCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition flex flex-col items-start space-y-3 border border-gray-200 dark:border-gray-800">
        <Icon size={24} className="text-yellow-600 dark:text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

// --- Navigation Bar Component ---
const NavigationBar: React.FC = () => {
    const navigate = useNavigate();
    const { handleLoginTransition, toggleTheme, theme } = useAuth(); 

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-3 px-4 sm:px-8 bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-xl border-b border-gray-200 dark:border-yellow-400/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-900 dark:text-white">
                <h1 className="text-xl sm:text-2xl font-extrabold">
                    <Link to="/" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 transition">QS Pocket Knife</Link>
                </h1>
                
                <div className="flex items-center space-x-2 sm:space-x-6 font-semibold">
                    <div className="hidden md:flex space-x-6 text-sm">
                        <Link to="/#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition">How It Works</Link>
                        <Link to="/#features" className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition">Why us</Link>
                    </div>

                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:ring-2 ring-yellow-500 transition-all cursor-pointer"
                        title={theme === 'dark' ? "Switch to Sunlight Mode" : "Switch to Drafting Mode"}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-yellow-600 dark:border-yellow-400/50 rounded-lg text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="bg-yellow-500 text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-yellow-400 transition text-xs sm:text-sm font-bold shadow-lg"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};

const MarketingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleLoginTransition } = useAuth();
    
    const NAVBAR_HEIGHT_OFFSET = 90; 
    
    useEffect(() => {
        // REMOVED: local theme management code. AuthContext handles this now!

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

    const typingWords = ['Accurate BoQs.', 'Local SMM Compliance.', 'Detailed Valuations.', 'Offline Site Takeoffs.'];

    return (
        /* We use min-h-screen and standard Tailwind colors that react to the 'dark' class */
        <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-yellow-500/30 transition-colors duration-500">
            <NavigationBar />

            {/* --- 1. Hero Section --- */}
            <header 
                className="relative min-h-screen flex items-center justify-center text-white text-center px-4"
                style={{ backgroundImage: `url('${HERO_BG_IMAGE_URL}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/30 dark:via-black/50 to-white dark:to-black transition-all duration-500"></div>
                <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-brightness-90 dark:backdrop-brightness-50"></div> 

                <div className="relative z-10 pt-28 pb-12 w-full max-w-5xl mx-auto"> 
                    <p className="text-xs sm:text-sm uppercase tracking-widest text-yellow-400 mb-3 font-bold drop-shadow-md">
                        The Essential Mobile Toolkit for Quantity Surveyors
                    </p>
                    <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight"> 
                        <span className="text-white block h-12 sm:h-24 md:h-32"> 
                            <Typewriter words={typingWords} loop={true} cursor cursorStyle="_" typeSpeed={70} deleteSpeed={50} delaySpeed={1500} />
                        </span>
                        Delivered On-Site.
                    </h1>
                    <p className="text-sm sm:text-xl text-gray-100 dark:text-gray-200 mb-10 max-w-3xl mx-auto font-medium drop-shadow-lg leading-relaxed"> 
                        Eliminate manual errors and excessive costs. Get compliant measurements and financial documentation designed specifically for the African construction sector.
                    </p>
                    
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="inline-block w-full sm:w-auto bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transition transform hover:scale-[1.02] active:scale-95" 
                    >
                        Start Your Free Trial →
                    </button>
                    <p className="mt-4 text-xs sm:text-sm text-yellow-100 font-medium opacity-90">Installs on any device as an offline-ready PWA.</p>
                </div>
            </header>

            {/* --- 2. How It Works Section --- */}
            <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6"> 
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
                        Measure.<span className="text-yellow-600 dark:text-yellow-500"> Estimate.</span> Certify.
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> 
                        <FeatureCard 
                            icon={Tablet} 
                            title="1. Mobile Digital Takeoff" 
                            description="Use your phone/tablet on-site to measure areas and volumes. Core tools work perfectly with zero connectivity."
                        />
                        <FeatureCard 
                            icon={LayoutGrid} 
                            title="2. Localized BoQ Generation" 
                            description="Automatically generate structured Bills of Quantities compliant with East African SMM requirements."
                        />
                        <FeatureCard 
                            icon={DollarSign} 
                            title="3. Interim Valuation Tools" 
                            description="Quickly certify contractor payments and track financial progress directly from the construction site."
                        />
                    </div>
                </div>
            </section>

            {/* --- 3. Features Section --- */}
            <section id="features" className="py-16 sm:py-24 bg-white dark:bg-black px-6"> 
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-4">
                        Why Switch from Manual Methods?
                    </h2>
                    <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
                        Your practice demands accuracy and mobility. Existing software is often too expensive for local firms.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <ValuePropCard icon={Zap} title="Offline-First PWA" description="Works in remote areas with zero connectivity. Your data stays safe and syncs when back in range." />
                        <ValuePropCard icon={MapPin} title="Built for East Africa" description="Preloaded with templates for local Road/Bridge works and PPRA documentation." />
                        <ValuePropCard icon={DollarSign} title="Affordable & Scalable" description="Pricing designed for local QS firms, avoiding high international license costs." />
                        <ValuePropCard icon={LayoutGrid} title="Resource Planning" description="Generate material schedules and breakdowns automatically to avoid site wastage." />
                        <ValuePropCard icon={Tablet} title="GPS Site Takeoffs" description="Utilize GPS and camera tools for quick, accurate site takeoffs, replacing paper notes." />
                        <ValuePropCard icon={CheckCircle} title="Simple to Learn" description="A streamlined UX focused on speed, avoiding the bloated interfaces of legacy software." />
                    </div>
                </div>
            </section>
            
            {/* Final CTA Section */}
            <section id="final-cta" className="py-16 sm:py-24 bg-yellow-50 dark:bg-gray-900 text-center px-6 transition-colors"> 
                <h2 className="text-2xl sm:text-5xl font-extrabold mb-6 text-yellow-800 dark:text-amber-500">Ready to Modernize Your Practice?</h2> 
                <p className="text-base sm:text-xl mb-10 font-medium max-w-2xl mx-auto text-gray-700 dark:text-gray-300">Get the power of a dedicated QS toolkit at a fraction of the cost.</p>
                <button 
                    onClick={() => handleLoginTransition(navigate)}
                    className="inline-block w-full sm:w-auto py-4 px-12 bg-yellow-600 dark:bg-yellow-500 text-white dark:text-gray-900 font-bold rounded-xl text-lg hover:bg-yellow-700 dark:hover:bg-yellow-400 transition transform hover:scale-[1.05] shadow-2xl active:scale-95" 
                >
                    Create Your Account Now
                </button>
            </section>

            {/* Footer */}
            <footer className="w-full p-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-gray-900 transition-colors">
                <div className="mb-4 text-yellow-600 dark:text-yellow-500 font-bold tracking-widest uppercase">QS Pocket Knife</div>
                &copy; {new Date().getFullYear()} Developed for the East African Construction Market.
            </footer>
        </div>
    );
};

export default MarketingPage;