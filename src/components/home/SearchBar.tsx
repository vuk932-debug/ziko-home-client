import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import LocationSelector from '../common/LocationSelector';

export interface SearchFilters {
  country: string;
  state: string;
  city: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  propertyType: string;
  bhk: string;
}

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const BUDGET_RANGES = [
  { value: '', label: 'Any Budget' },
  { value: '0-2500000', label: 'Under ₹25 Lakh' },
  { value: '2500000-5000000', label: '₹25L – ₹50L' },
  { value: '5000000-10000000', label: '₹50L – ₹1 Cr' },
  { value: '10000000-20000000', label: '₹1 Cr – ₹2 Cr' },
  { value: '20000000-99999999', label: 'Above ₹2 Cr' },
];

interface SearchBarProps {
  initialFilters?: Partial<SearchFilters>;
  variant?: 'hero' | 'compact';
}

const SearchBar = ({ initialFilters = {}, variant = 'hero' }: SearchBarProps) => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SearchFilters>({
    country: initialFilters.country ?? '',
    state: initialFilters.state ?? '',
    city: initialFilters.city ?? '',
    location: initialFilters.location ?? '',
    budgetMin: initialFilters.budgetMin ?? '',
    budgetMax: initialFilters.budgetMax ?? '',
    propertyType: initialFilters.propertyType ?? '',
    bhk: initialFilters.bhk ?? '',
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleBudgetChange = (rangeValue: string) => {
    if (!rangeValue) {
      setFilters((prev) => ({ ...prev, budgetMin: '', budgetMax: '' }));
      return;
    }
    const [min, max] = rangeValue.split('-');
    setFilters((prev) => ({ ...prev, budgetMin: min, budgetMax: max }));
  };

  const buildQueryString = (): string => {
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    if (filters.state) params.set('state', filters.state);
    if (filters.city) params.set('city', filters.city);
    if (filters.location.trim()) params.set('location', filters.location.trim());
    if (filters.budgetMin) params.set('budgetMin', filters.budgetMin);
    if (filters.budgetMax) params.set('budgetMax', filters.budgetMax);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.bhk) params.set('bhk', filters.bhk);
    return params.toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = buildQueryString();
    navigate(`/properties${qs ? `?${qs}` : ''}`);
  };

  const selectedBudgetRange =
    filters.budgetMin && filters.budgetMax
      ? `${filters.budgetMin}-${filters.budgetMax}`
      : '';

  const isHero = variant === 'hero';

  return (
    <form
      id="property-search-form"
      onSubmit={handleSubmit}
      className={`w-full ${isHero ? 'max-w-6xl mx-auto' : 'max-w-full'}`}
    >
      <div
        className={`
          glass-morphism rounded-2xl border-white/10
          ${isHero ? 'p-2 flex flex-col md:flex-row gap-2' : 'p-4 flex flex-col gap-3'}
        `}
      >
        {/* ── Keyword/Area ────────────────────────────────────────────── */}
        <div className={`relative flex-[1.2] ${isHero ? 'min-w-0' : ''}`}>
          {isHero && <span className="absolute left-4 top-2 text-[10px] text-brand-muted uppercase font-bold tracking-wider">Search</span>}
          <input
            type="text"
            placeholder={isHero ? "Area / Phase / Title" : "Search area..."}
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`
              w-full bg-brand-deep/20 text-white placeholder:text-brand-muted/30
              focus:outline-none focus:ring-1 focus:ring-brand-neon/50 rounded-xl transition-all
              ${isHero ? 'px-4 pt-6 pb-2 text-sm font-semibold' : 'px-4 py-3 text-sm border border-white/5'}
            `}
          />
        </div>

        {isHero && <div className="hidden md:block w-[1px] bg-white/5 self-stretch my-3" />}

        {/* ── Location Hierarchy ────────────────────────────────────────── */}
        <div className="flex-[4] min-w-0">
          <LocationSelector 
            values={{ country: filters.country, state: filters.state, city: filters.city }}
            onChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
            className={`grid gap-2 ${isHero ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}
            showLabels={false}
            placeholders={{
              country: "Country",
              state: "State",
              city: "City"
            }}
            inputClassName={`
              w-full bg-brand-deep/20 text-white border-none rounded-xl transition-all
              ${isHero ? 'px-4 py-4 text-sm font-semibold' : 'px-3 py-2.5 text-sm border border-white/5'}
            `}
            optionsClassName="bg-brand-bg text-white border border-white/10"
          />
        </div>

        {isHero && <div className="hidden md:block w-[1px] bg-white/5 self-stretch my-3" />}

        {/* ── Budget ───────────────────────────────────────────────────── */}
        <div className={`relative flex-1 ${isHero ? 'min-w-0' : ''}`}>
          {isHero && <span className="absolute left-4 top-2 text-[10px] text-brand-muted uppercase font-bold tracking-wider">Budget</span>}
          <select
            id="search-budget"
            value={selectedBudgetRange}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className={`
              w-full bg-brand-deep/20 text-white appearance-none cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-brand-neon/50 rounded-xl transition-all
              ${isHero ? 'px-4 pt-6 pb-2 text-sm font-semibold' : 'px-4 py-3 text-sm border border-white/5'}
            `}
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value} className="bg-brand-bg text-white">
                {b.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
        </div>

        {/* ── Property Type ─────────────────────────────────────────────── */}
        <div className={`relative flex-1 ${isHero ? 'min-w-0' : ''}`}>
          {isHero && <span className="absolute left-4 top-2 text-[10px] text-brand-muted uppercase font-bold tracking-wider">Type</span>}
          <select
            id="search-property-type"
            value={filters.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className={`
              w-full bg-brand-deep/20 text-white appearance-none cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-brand-neon/50 rounded-xl transition-all
              ${isHero ? 'px-4 pt-6 pb-2 text-sm font-semibold' : 'px-4 py-3 text-sm border border-white/5'}
            `}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-brand-bg text-white">
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <button
          id="search-submit"
          type="submit"
          className={`
            btn-primary flex items-center justify-center gap-2
            ${isHero ? 'px-8 py-4 flex-shrink-0 rounded-xl' : 'w-full py-3 mt-1'}
          `}
        >
          <Search className="w-4 h-4" />
          <span className="font-bold tracking-wide uppercase text-xs">{isHero ? 'Discover' : 'Search'}</span>
        </button>
      </div>

      {isHero && (
        <div className="flex items-center justify-center gap-6 mt-6">
           <p className="text-brand-secondary text-[11px] font-medium flex items-center gap-2 uppercase tracking-widest opacity-70">
            <SlidersHorizontal className="w-3 h-3 text-brand-neon" />
            Precision Filters
          </p>
          <div className="h-[1px] w-8 bg-white/10"></div>
          <p className="text-brand-secondary text-[11px] font-medium flex items-center gap-2 uppercase tracking-widest opacity-70">
            <Sparkles className="w-3 h-3 text-brand-neon" />
            Verified Listings Only
          </p>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
