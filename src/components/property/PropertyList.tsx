import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, Loader2 } from 'lucide-react';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import { fetchProperties, type Property } from '../../api/propertyApi';
import apiClient from '../../api/axios';

const PropertyList = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize a random seed for this session/mount to keep pagination stable
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));

  // Impression Tracking
  useEffect(() => {
    if (properties.length === 0 || !containerRef.current) return;
    
    let viewedIds = new Set<string>();
    let batch: string[] = [];
    let timeoutId: any;

    const flushBatch = () => {
      if (batch.length > 0) {
        apiClient.post('/properties/impressions', { propertyIds: [...batch] }).catch(console.error);
        batch = [];
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-property-id');
            if (id && !viewedIds.has(id)) {
              viewedIds.add(id);
              batch.push(id);
              
              clearTimeout(timeoutId);
              timeoutId = setTimeout(flushBatch, 2000); // Flush after 2s
            }
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    const cards = containerRef.current.querySelectorAll('.property-card-tracked');
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      flushBatch(); // Flush remaining on unmount
    };
  }, [properties]);

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        // Map URL search params to API params
        const params: any = {
          location: searchParams.get('location') || undefined,
          country: searchParams.get('country') || undefined,
          state: searchParams.get('state') || undefined,
          city: searchParams.get('city') || undefined,
          category: searchParams.get('category') || undefined,
          propertyType: searchParams.get('type') || undefined,
          bedrooms: searchParams.get('bhk') || undefined,
          minPrice: searchParams.get('budgetMin') || undefined,
          maxPrice: searchParams.get('budgetMax') || undefined,
          sortBy: (searchParams.get('sortBy') as any) || 'relevance',
          page: parseInt(searchParams.get('page') || '1', 10),
          limit: 9, // showing 9 properties per page for clean 3x3 grid
          seed: seed
        };

        const result = await fetchProperties(params);
        setProperties(result.properties);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [searchParams.toString(), seed]);

  // ── States ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse glass-card rounded-2xl overflow-hidden border-white/5 h-[400px]">
              <div className="aspect-[4/3] bg-white/5" />
              <div className="p-6 flex flex-col gap-4">
                <div className="h-6 bg-white/5 rounded-lg w-3/4" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                <div className="h-[1px] bg-white/5 mt-4" />
                <div className="flex gap-4">
                   <div className="h-10 bg-white/5 rounded-xl w-1/2" />
                   <div className="h-10 bg-white/5 rounded-xl w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12 py-8">
          <Loader2 className="w-10 h-10 text-brand-neon animate-spin shadow-glow" />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    const activeFilters = [
      { label: 'Location', value: searchParams.get('location') },
      { label: 'Country', value: searchParams.get('country') },
      { label: 'State', value: searchParams.get('state') },
      { label: 'City', value: searchParams.get('city') },
      { label: 'Type', value: searchParams.get('type') },
      { label: 'BHK', value: searchParams.get('bhk') ? `${searchParams.get('bhk')} BHK` : null },
      { 
        label: 'Budget', 
        value: searchParams.get('budgetMin') || searchParams.get('budgetMax') 
          ? `₹${(Number(searchParams.get('budgetMin') || 0) / 100000).toFixed(0)}L - ₹${searchParams.get('budgetMax') ? (Number(searchParams.get('budgetMax')) / 10000000).toFixed(1) + 'Cr' : '∞'}` 
          : null 
      },
    ].filter(f => f.value);

    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="glass-card rounded-[2.5rem] p-12 max-w-xl w-full text-center border-white/10 shadow-glow-lg">
          <div className="w-24 h-24 bg-brand-neon/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-brand-neon/20 shadow-glow">
            <SearchX className="w-12 h-12 text-brand-neon" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
            No Data Found
          </h3>
          <p className="text-brand-secondary mb-6 font-medium opacity-70">
            We couldn't locate any properties matching your current constraints:
          </p>

          {/* Active Filter Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {activeFilters.map((filter, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-neon mb-1">{filter.label}</span>
                <span className="text-xs font-bold text-white uppercase">{filter.value}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.href = '/properties'}
            className="btn-outline w-full !py-4"
          >
            Clear All Constraints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" ref={containerRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property.id} className="property-card-tracked" data-property-id={property.id}>
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
      
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default PropertyList;
