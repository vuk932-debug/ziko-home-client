import { useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection, { CATEGORIES } from '../components/home/HeroSection';
import CategoryCard from '../components/home/CategoryCard';
import apiClient from '../api/axios';

const WHY_US = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand-neon" />,
    title: 'Precision Verification',
    desc: 'Our proprietary verification engine ensures every listing is 100% authentic.',
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-accent" />,
    title: 'RERA Approved Agents',
    desc: 'Every listing on the platform is handled by RERA-registered agents, ensuring complete transparency and verified authenticity.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-brand-neon" />,
    title: 'Premium Experience',
    desc: 'An optimized platform on clarity, ease of use, and a consistent user journey.',
  },
];

const Home = () => {
  useEffect(() => {
    // Keep a simple health check if needed for analytics, but not blocking UI
    apiClient.get('/health').catch(() => console.warn('System status check deferred'));
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen text-white">
      {/* ── 1. Hero ─────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. Category Section ──────────────────────────────── */}
      <section
        aria-labelledby="categories-heading"
        className="py-32 relative overflow-hidden"
      >
        {/* Background Decorative */}
        <div className="absolute top-1/2 left-0 w-1/2 h-full bg-brand-neon/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2
              id="categories-heading"
              className="text-4xl md:text-5xl font-black tracking-tighter"
            >
              The Next Frontier of <span className="text-brand-neon neon-text">Discovery</span>
            </h2>
            <p className="text-brand-secondary max-w-xl mx-auto text-lg font-medium opacity-70">
              Select your path below to explore our curated ecosystem of premium real estate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Why Ziko Section ────────────────────────────────────── */}
      <section
        aria-labelledby="why-us-heading"
        className="py-32 relative"
      >
        {/* Glow */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-brand-accent/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            <div className="lg:col-span-1 space-y-6">
               <h2
                id="why-us-heading"
                className="text-4xl md:text-5xl font-black tracking-tighter leading-tight"
              >
                Why Trust <br />
                <span className="text-brand-neon">Ziko Home</span>?
              </h2>
              <p className="text-brand-secondary text-lg font-medium opacity-70">
                We're not just a platform; we're an advanced real estate ecosystem 
                engineered for the future of living.
              </p>
              <div className="h-[2px] w-20 bg-brand-neon shadow-glow" />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {WHY_US.map((item) => (
                <div
                  key={item.title}
                  className="group p-8 rounded-3xl glass-card border-white/5 hover:border-brand-neon/30 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-brand-secondary text-sm leading-relaxed opacity-70">
                    {item.desc}
                  </p>
                </div>
              ))}
              {/* Special empty box for layout balance or additional feature */}
              <div className="hidden md:flex p-8 rounded-3xl bg-gradient-to-br from-brand-neon to-brand-accent items-center justify-center text-center shadow-glow overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10">
                   <h4 className="text-2xl font-black text-white mb-2">Join 50K+</h4>
                   <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Global Homeowners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[40px] overflow-hidden group">
            <div className="absolute inset-0 bg-hero-gradient opacity-90 transition-transform duration-700 group-hover:scale-105" />
            
            {/* Animated Glow */}
            <div className="absolute -top-1/2 -right-1/4 w-[80%] h-[150%] bg-brand-neon/10 rounded-full filter blur-[100px] animate-pulse-glow pointer-events-none" />

            <div className="relative z-10 py-20 px-8 text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                Ready to Claim Your <br />
                <span className="text-brand-neon">Future Home?</span>
              </h2>
              <p className="text-brand-secondary text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
                Join the Ziko Home ecosystem today and redefine how you experience real estate.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-4">
                <Link
                  to="/register"
                  className="btn-primary !px-12 !py-5 text-base w-full sm:w-auto"
                >
                  Initiate Membership
                </Link>
                <Link
                  to="/properties"
                  className="btn-outline !px-12 !py-5 text-base w-full sm:w-auto backdrop-blur-sm"
                >
                  Explore Catalog
                </Link>
              </div>

              <div className="pt-12 flex items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                 {/* Fake partner logos or tech icons */}
                 <div className="text-[10px] font-black tracking-[0.4em] uppercase">Powered by Next-Gen AI</div>
                 <div className="h-1 w-1 rounded-full bg-white/40" />
                 <div className="text-[10px] font-black tracking-[0.4em] uppercase">Zero Middleware</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
