import { Sparkles, CheckCircle2, HardHat, RefreshCcw, ArrowRight } from 'lucide-react';
import SearchBar from './SearchBar';
import type { Category } from './CategoryCard';

export const CATEGORIES: Category[] = [
  {
    id: 'new-projects',
    title: 'New Projects',
    description: 'Brand-new launches from top developers with early-bird pricing.',
    categoryParam: 'NEW_PROJECT',
    Icon: Sparkles,
    gradient: 'bg-gradient-to-br from-brand-neon to-brand-accent',
    iconColor: 'text-white',
    badge: 'Hot',
  },
  {
    id: 'ready-to-move',
    title: 'Ready to Move In',
    description: 'Fully completed, possession-ready homes — move in within 30 days.',
    categoryParam: 'READY_TO_MOVE',
    Icon: CheckCircle2,
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconColor: 'text-white',
  },
  {
    id: 'under-construction',
    title: 'Under Construction',
    description: 'Properties with flexible payment plans and lower entry prices.',
    categoryParam: 'UNDER_CONSTRUCTION',
    Icon: HardHat,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-white',
  },
  {
    id: 'resale-properties',
    title: 'Resale Properties',
    description: 'Pre-owned homes, resale flats and villas from verified private sellers.',
    categoryParam: 'RESALE',
    Icon: RefreshCcw,
    gradient: 'bg-gradient-to-br from-sky-500 to-cyan-600',
    iconColor: 'text-white',
  },
];

const HERO_STATS = [
  { value: '1K+', label: 'Verified Listings' },
  { value: '100+', label: 'Prime Locations' },
  { value: '4.9★', label: 'User Trust' },
];

const HeroSection = () => {
  return (
    <section
      aria-label="Property search hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-brand-bg"
    >
      {/* ── Background Visuals ────────────────────────────────── */}
      <div className="absolute inset-0 bg-hero-gradient opacity-80" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-neon/20 rounded-full filter blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full filter blur-[120px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #8B5CF6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center text-center">

        {/* Futuristic Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-neon/10 backdrop-blur-md border border-brand-neon/30 rounded-full px-5 py-2 text-brand-accent text-xs font-semibold tracking-wider uppercase animate-fade-in mb-8 shadow-glow">
          <Sparkles className="w-3.5 h-3.5" />
          The Next Generation of Real Estate
        </div>

        {/* Headline */}
        <div className="animate-slide-up space-y-6 max-w-5xl">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white leading-tight tracking-tighter">
            Find. Trust. <span className="text-brand-neon neon-text">Own.</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-secondary max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Ziko Home is where futuristic technology meets premium real estate. 
            Discover verified properties with unparalleled transparency.
          </p>
        </div>

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <div className="w-full max-w-6xl mt-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-2 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-glow">
            <SearchBar variant="hero" />
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 md:gap-12 mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="text-center group">
              <p className="text-2xl md:text-4xl font-black text-white group-hover:text-brand-neon transition-all duration-300">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-brand-muted mt-1 uppercase tracking-widest font-bold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <button className="mt-16 animate-bounce text-brand-secondary hover:text-white transition-colors">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Explore More</span>
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>
        </button>

      </div>

      {/* ── Decorative Elements ──────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-bg to-transparent z-20" />
    </section>
  );
};

export default HeroSection;
