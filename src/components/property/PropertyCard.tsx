import { useNavigate } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Sparkles } from 'lucide-react';
import type { Property } from '../../api/propertyApi';
import { useAuth } from '../../context/AuthContext';
import { cleanImageUrl } from '../../utils/urlHelper';

interface PropertyCardProps {
  property: Property;
}

const CATEGORY_DISPLAY: Record<string, string> = {
  NEW_PROJECT: 'New Projects',
  READY_TO_MOVE: 'Ready to Move In',
  UNDER_CONSTRUCTION: 'Under Construction',
  RESALE: 'Secondary Property',
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const handlePropertyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal(`/property/${property.id}`);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden border-white/5 hover:border-brand-neon/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-lg flex flex-col h-full">
      {/* ── Image Section ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-deep/50">
        <img
          src={cleanImageUrl(property.images[0]?.url)}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent opacity-60" />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.isFeatured && (
            <span className="bg-brand-neon text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-glow animate-pulse-glow flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          <span className="bg-brand-deep/60 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {CATEGORY_DISPLAY[property.category] || property.category?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4">
           <div className="bg-brand-bg/40 backdrop-blur-xl border border-white/10 text-white px-4 py-1.5 rounded-xl font-black text-xl shadow-glow">
            {property.priceLabel}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-brand-neon transition-colors">
          <a href={`/property/${property.id}`} onClick={handlePropertyClick} className="focus:outline-none cursor-pointer">
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {property.title}
          </a>
        </h3>

        <div className="flex items-center text-brand-secondary text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1.5 text-brand-neon flex-shrink-0" />
          <span className="truncate opacity-80">{property.structuredLocation.area}, {property.structuredLocation.city}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5 mt-auto">
          {property.bhk !== null && (
            <div className="flex items-center gap-3 text-brand-secondary">
              <div className="w-9 h-9 rounded-xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center">
                <BedDouble className="w-4 h-4 text-brand-neon" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">{property.bhk} BHK</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-brand-secondary">
            <div className="w-9 h-9 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
              <Maximize className="w-4 h-4 text-brand-accent" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide">{property.areaSqft} <span className="text-[10px] opacity-60">Sqft</span></span>
          </div>
        </div>

        {/* CTA Hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] group-hover:text-brand-neon transition-colors">
          View Details
          <Maximize className="w-3 h-3 group-hover:scale-125 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
