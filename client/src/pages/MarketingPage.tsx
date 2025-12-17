import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LayoutGrid, Zap, MapPin, Tablet, DollarSign, CheckCircle } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter'; 
import { useAuth } from '../lib/AuthContext';

const HERO_BG_IMAGE_URL = '../src/assets/image.jpg'; 

// --- Helper Components ---
interface FeatureCardProps { icon: React.ElementType, title: string, description: string }
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border-t-4 border-yellow-500 hover:shadow-2xl transition transform hover:scale-[1.01] text-center">
        <Icon size={32} className="text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-100">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
    </div>
);

interface ValuePropCardProps { icon: React.ElementType, title: string, description: string }
const ValuePropCard: React.FC<ValuePropCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition flex flex-col items-start space-y-3 border border-gray-800">
        <Icon size={24} className="text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

// --- Navigation Bar Component ---
const NavigationBar: React.FC = () => {
    const navigate = useNavigate();
    const { handleLoginTransition } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:px-8 bg-black/90 backdrop-blur-sm shadow-2xl border-b border-yellow-400/20">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
                <h1 className="text-2xl font-extrabold">
                    <Link to="/" className="text-yellow-400 hover:text-yellow-300 transition">QS Pocket Knife</Link>
                </h1>
                
                <div className="flex items-center space-x-4 sm:space-x-6 font-semibold">
                    <div className="hidden md:flex space-x-6 text-sm">
                        <Link to="/#how-it-works" className="text-gray-300 hover:text-yellow-400 transition">How It Works</Link>
                        <Link to="/#features" className="text-gray-300 hover:text-yellow-400 transition">Why us</Link>
                        <Link to="/#how-it-works" className="text-gray-300 hover:text-yellow-400 transition">Features</Link>
                    </div>
                    
                    {/* AUTH BUTTONS WITH SPIN TRANSITION */}
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-yellow-400/50 rounded-lg hover:bg-yellow-400/20 transition text-xs sm:text-sm text-yellow-400"
                    >
                        <LogIn size={14} className="mr-1 hidden sm:inline" /> Sign In
                    </button>
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="bg-yellow-500 text-gray-900 px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-yellow-400 transition text-xs sm:text-sm font-bold shadow-lg"
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
        <div className="min-h-full bg-black font-sans selection:bg-yellow-500/30">
            <NavigationBar />

            {/* --- 1. Hero Section --- */}
            <header 
                className="relative min-h-screen flex items-center justify-center text-white text-center"
                style={{ backgroundImage: `url('${HERO_BG_IMAGE_URL}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-brightness-50"></div> 

                <div className="relative z-10 pt-28 pb-12 px-6 max-w-5xl mx-auto"> 
                    <p className="text-sm uppercase tracking-widest text-yellow-500 mb-2 font-bold">
                        The Essential Mobile Toolkit for Quantity Surveyors
                    </p>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 leading-tight"> 
                        <span className="text-white block h-16 sm:h-24"> 
                            <Typewriter
                                words={typingWords}
                                loop={true}
                                cursor
                                cursorStyle="_"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1500}
                            />
                        </span>
                        Delivered On-Site.
                    </h1>
                    <p className="text-base sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto font-light"> 
                        Eliminate manual errors and excessive costs. Get compliant measurements and financial documentation designed specifically for the African construction sector.
                    </p>
                    
                    {/* HERO BUTTON WITH SPIN TRANSITION */}
                    <button 
                        onClick={() => handleLoginTransition(navigate)}
                        className="inline-block bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transition transform hover:scale-[1.02] w-full sm:w-auto" 
                    >
                        Start Your Free Trial →
                    </button>
                    <p className="mt-4 text-sm text-yellow-200/60 font-medium">No credit card required. Installs on any device as a PWA.</p>
                </div>
            </header>

            {/* --- 2. How It Works Section --- */}
            <section id="how-it-works" className="py-16 sm:py-24 bg-gray-900 border-b border-gray-800"> 
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 sm:mb-16">
                        Measure.<span className="text-yellow-500"> Estimate.</span> Certify.
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-8"> 
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

            {/* --- 3. Features Section --- */}
            <section id="features" className="py-16 sm:py-24 bg-black"> 
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-100 text-center mb-4">
                        Why Switch from Manual Methods?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                        Your practice demands accuracy and mobility. Existing software is too expensive and complex.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ValuePropCard icon={Zap} title="Offline-First PWA" description="Core functions work perfectly in remote areas with zero connectivity. Sync happens automatically later." />
                        <ValuePropCard icon={MapPin} title="Built for East Africa" description="Preloaded with templates for local SMM, Road/Bridge works, and PPRA documentation." />
                        <ValuePropCard icon={DollarSign} title="Affordable & Scalable" description="Designed for local QS firms. Pricing is transparent and accessible, unlike international licenses." />
                        <ValuePropCard icon={LayoutGrid} title="Automated Resource Planning" description="Generate material schedules and automatic breakdowns for mixes to avoid site wastage." />
                        <ValuePropCard icon={Tablet} title="Mobile Site Measurement" description="Utilize GPS and camera tools for quick, accurate site takeoffs, replacing paper notes." />
                        <ValuePropCard icon={CheckCircle} title="Simple to Learn" description="A streamlined UX focused on speed, avoiding the bloated interfaces of legacy software." />
                    </div>
                </div>
            </section>
            
            {/* Final CTA WITH SPIN TRANSITION */}
            <section id="final-cta" className="py-16 sm:py-24 bg-gray-900 text-gray-900 text-center"> 
                <h2 className="text-3xl text-amber-600 sm:text-5xl font-extrabold mb-6">Ready to Modernize Your Practice?</h2> 
                <p className="text-lg text-amber-500 sm:text-xl mb-10 font-medium opacity-90">Get the power of a dedicated tool at a fraction of the cost.</p>
                <button 
                    onClick={() => handleLoginTransition(navigate)}
                    className="inline-block py-4 px-12 bg-amber-900 text-yellow-500 font-bold rounded-xl text-lg hover:bg-black transition transform hover:scale-[1.05] shadow-2xl" 
                >
                    Create Your Account Now
                </button>
            </section>

            {/* Footer */}
            <footer className="w-full p-8 text-center text-sm text-gray-500 bg-black border-t border-gray-900">
                <div className="mb-4 text-yellow-500 font-bold tracking-widest uppercase">QS Pocket Knife</div>
                &copy; {new Date().getFullYear()} Developed for the East African Market.
            </footer>
        </div>
    );
};

export default MarketingPage;