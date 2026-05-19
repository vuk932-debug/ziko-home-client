import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import FilterSidebar from '../components/property/FilterSidebar';
import PropertyList from '../components/property/PropertyList';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  
  const CATEGORY_LABELS: Record<string, string> = {
    NEW_PROJECT: 'New Projects',
    READY_TO_MOVE: 'Ready to Move In',
    UNDER_CONSTRUCTION: 'Under Construction',
    RESALE: 'Secondary Properties',
  };

  const pageTitle = categoryParam
    ? CATEGORY_LABELS[categoryParam] ?? 'Properties'
    : 'All Properties';

  return (
    <div className="min-h-screen bg-brand-bg mt-16 pt-1">
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="glass-morphism border-b border-white/5 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-full bg-brand-neon/5 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
                 <Sparkles className="w-3 h-3" />
                 Verified Catalog
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                {pageTitle}
              </h1>
              <p className="text-brand-secondary font-medium text-lg opacity-70 max-w-2xl">
                Discover the next generation of premium living. Our listings are curated 
                for quality, verified for trust, and designed for your future.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-brand-muted text-[11px] font-bold uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <span className="text-brand-neon">Real-time</span> Market Sync Active
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-32 z-30">
            <div className="lg:hidden flex items-center justify-between mb-6">
               <div className="flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm">
                <SlidersHorizontal className="w-5 h-5 text-brand-neon" /> Refine Search
              </div>
            </div>
            
            <div className="glass-card rounded-3xl border-white/5 p-1 relative">
              <FilterSidebar />
            </div>
          </aside>

          {/* List */}
          <main className="flex-1 w-full min-w-0">
            <PropertyList />
          </main>
          
        </div>
      </div>
      
    </div>
  );
};

export default PropertiesPage;
