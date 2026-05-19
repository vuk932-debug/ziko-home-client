import { BadgeCheck, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    title: string;
    price: number;
    location: string;
    images: { id: string; url: string }[];
    bedrooms: number;
    bathrooms: number;
    area: number;
    featured: boolean;
    cpId: {
      name: string;
      isVerified?: boolean;
    };
  };
}

const CATEGORY_DISPLAY: Record<string, string> = {
  NEW_PROJECT: 'New Projects',
  READY_TO_MOVE: 'Ready to Move In',
  UNDER_CONSTRUCTION: 'Under Construction',
  RESALE: 'Secondary Property',
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-lg border-white/5 hover:border-brand-neon/30">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Gradients & Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {(property as any).category && (
            <span className="px-3 py-1 bg-brand-deep/60 text-white backdrop-blur-md text-[9px] font-bold rounded-lg border border-white/10 uppercase tracking-widest">
              {CATEGORY_DISPLAY[(property as any).category] || (property as any).category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="text-2xl font-black text-white drop-shadow-lg">
            ${property.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-brand-neon transition-colors">
          <Link to={`/property/${property.id}`}>
            {property.title}
          </Link>
        </h3>
        
        <p className="text-brand-secondary flex items-center text-xs mb-4">
          <MapPin className="w-3.5 h-3.5 mr-1 text-brand-neon" />
          {property.location}
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 mb-4">
          <div className="flex items-center gap-1.5 text-brand-secondary">
            <BedDouble className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-secondary">
            <Bath className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-secondary">
            <Maximize className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold">{property.area} <span className="text-[10px] opacity-60">sqft</span></span>
          </div>
        </div>

        {/* CP Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-neon/20 border border-brand-neon/30 flex items-center justify-center text-brand-neon text-[10px] font-bold">
              {property.cpId?.name?.charAt(0) || 'Z'}
            </div>
            <p className="text-[11px] font-bold text-brand-secondary flex items-center gap-1">
              {property.cpId?.name || 'Ziko Partner'}
              {property.cpId?.isVerified && (
                 <BadgeCheck className="w-3.5 h-3.5 text-brand-neon" />
              )}
            </p>
          </div>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-brand-neon hover:text-white transition-all text-brand-muted">
             <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
