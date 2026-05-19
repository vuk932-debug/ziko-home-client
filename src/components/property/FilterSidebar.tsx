import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { Search, Building, Banknote, LayoutGrid, X, Globe, MapPin } from 'lucide-react';
import LocationSelector from '../common/LocationSelector';

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const BHK_OPTIONS = [
  { value: '', label: 'Any BHK' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'NEW_PROJECT', label: 'New Projects' },
  { value: 'READY_TO_MOVE', label: 'Ready to Move In' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'RESALE', label: 'Secondary Property' },
];

const BUDGET_RANGES = [
  { value: '', label: 'Any Budget', min: '', max: '' },
  { value: 'under-50l', label: 'Under ₹50 Lakh', min: '0', max: '5000000' },
  { value: '50l-1cr', label: '₹50L - ₹1 Cr', min: '5000000', max: '10000000' },
  { value: '1cr-2cr', label: '₹1 Cr - ₹2 Cr', min: '10000000', max: '20000000' },
  { value: 'above-2cr', label: 'Above ₹2 Cr', min: '20000000', max: '' },
];

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      newParams.delete('page');
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  const updateFiltersBulk = useCallback((updates: Record<string, string>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
        else newParams.delete(key);
      });
      newParams.delete('page');
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  const handleBudgetChange = (value: string) => {
    const range = BUDGET_RANGES.find(r => r.value === value);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (range && range.min) newParams.set('budgetMin', range.min);
      else newParams.delete('budgetMin');
      
      if (range && range.max) newParams.set('budgetMax', range.max);
      else newParams.delete('budgetMax');

      newParams.delete('page');
      return newParams;
    }, { replace: true });
  };

  const currentBudgetRange = () => {
    const min = searchParams.get('budgetMin') || '';
    const max = searchParams.get('budgetMax') || '';
    const selected = BUDGET_RANGES.find(r => r.min === min && r.max === max);
    return selected ? selected.value : '';
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="bg-brand-deep/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter">
          <Search className="w-5 h-5 text-brand-neon" /> Refine
        </h2>
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-red-400 flex items-center gap-1 transition-all"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Hierarchical Location Filter */}
        <LocationSelector 
          values={{
            country: searchParams.get('country') || '',
            state: searchParams.get('state') || '',
            city: searchParams.get('city') || '',
          }}
          onChange={(field, value) => updateFilter(field, value)}
          onBulkChange={(updates) => updateFiltersBulk(updates)}
          className="space-y-6"
          showLabels={true}
          labels={{
            country: (
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-1">
                <Globe className="w-3.5 h-3.5 text-brand-neon" /> Country Reference
              </label>
            ),
            state: (
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-1">
                <MapPin className="w-3.5 h-3.5 text-brand-neon" /> State/Territory
              </label>
            ),
            city: (
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-1">
                <MapPin className="w-3.5 h-3.5 text-brand-neon" /> Urban Node
              </label>
            )
          }}
          inputClassName="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white focus:border-brand-neon transition-all text-sm font-medium"
          optionsClassName="bg-brand-bg/95 text-white shadow-2xl border border-white/10"
          placeholders={{
            country: "All Countries",
            state: "All States",
            city: "All Cities"
          }}
        />

        {/* Specific Area Filter */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-neon" /> Area Vector
          </label>
          <input
            type="text"
            placeholder="Search area/sector..."
            value={searchParams.get('location') || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-brand-muted focus:border-brand-neon transition-all text-sm font-medium"
          />
        </div>

        {/* Property Type Filter */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary">
            <Building className="w-3.5 h-3.5 text-brand-neon" /> Asset Type
          </label>
          <select
            value={searchParams.get('type') || ''}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:border-brand-neon transition-all text-sm cursor-pointer appearance-none font-medium"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value} className="bg-brand-bg text-white">{type.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary">
            <LayoutGrid className="w-3.5 h-3.5 text-brand-neon" /> Listing Category
          </label>
          <select
            value={searchParams.get('category') || ''}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:border-brand-neon transition-all text-sm cursor-pointer appearance-none font-medium"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-brand-bg text-white">{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Budget Filter */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary">
            <Banknote className="w-3.5 h-3.5 text-brand-neon" /> Investment
          </label>
          <select
            value={currentBudgetRange()}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:border-brand-neon transition-all text-sm cursor-pointer appearance-none font-medium"
          >
            {BUDGET_RANGES.map((range) => (
              <option key={range.value} value={range.value} className="bg-brand-bg text-white">{range.label}</option>
            ))}
          </select>
        </div>

        {/* BHK Filter */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-secondary">
            <LayoutGrid className="w-3.5 h-3.5 text-brand-neon" /> Configuration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {BHK_OPTIONS.map((bhk) => {
              if (!bhk.value) return null;
              const isActive = searchParams.get('bhk') === bhk.value;
              return (
                <button
                  key={bhk.value}
                  onClick={() => updateFilter('bhk', isActive ? '' : bhk.value)}
                  className={`py-3 rounded-2xl text-[11px] font-bold tracking-wider transition-all border ${
                    isActive 
                      ? 'bg-brand-neon/20 border-brand-neon text-brand-neon shadow-glow' 
                      : 'bg-white/5 border-white/5 text-brand-secondary hover:border-brand-neon/30'
                  }`}
                >
                  {bhk.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-brand-neon/10 to-transparent border border-brand-neon/20">
         <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-2 opacity-60">Need more specifics?</p>
         <button className="text-xs font-black text-brand-neon hover:text-brand-accent transition-colors flex items-center gap-2">
           Talk to an Expert →
         </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
