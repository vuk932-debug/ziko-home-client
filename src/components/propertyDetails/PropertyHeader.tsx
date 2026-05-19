import React from 'react';
import { MapPin, Share2, Heart, Sparkles } from 'lucide-react';

interface PropertyHeaderProps {
  title: string;
  locationArea: string;
  locationCity: string;
  priceLabel: string;
  onShare?: () => void;
  onSave?: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title,
  locationArea,
  locationCity,
  priceLabel,
  onShare,
  onSave,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10">
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
          <Sparkles className="w-3 h-3" />
          Verified Asset
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
          {title}
        </h1>
        <div className="flex items-center text-brand-secondary font-bold uppercase tracking-widest text-xs opacity-70">
          <MapPin className="w-4 h-4 mr-2 text-brand-neon" />
          <span>{locationArea}, {locationCity}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-start lg:items-end gap-6">
        <div className="space-y-1 text-left lg:text-right">
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Market Valuation</span>
            <div className="text-5xl font-black text-white tracking-tighter neon-text">
              {priceLabel}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button 
            onClick={onSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-brand-neon/10 text-brand-secondary hover:text-brand-neon font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 hover:border-brand-neon/20"
          >
            <Heart className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;

