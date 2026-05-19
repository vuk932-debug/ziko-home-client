import React from 'react';
import { Check, ShieldCheck, Dumbbell, Waves, TreePine, Car } from 'lucide-react';

interface AmenitiesSectionProps {
  amenities?: string[];
}

// Fallback mock amenities if none provided by API
const MOCK_AMENITIES = [
  { name: '24/7 Security', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
  { name: 'Swimming Pool', icon: <Waves className="w-5 h-5 text-blue-500" /> },
  { name: 'Gymnasium', icon: <Dumbbell className="w-5 h-5 text-slate-500 dark:text-slate-400" /> },
  { name: 'Landscaped Gardens', icon: <TreePine className="w-5 h-5 text-green-500" /> },
  { name: 'Reserved Parking', icon: <Car className="w-5 h-5 text-indigo-500" /> },
];

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ amenities }) => {
  const displayAmenities = amenities && amenities.length > 0 
    ? amenities.map(a => ({ name: a, icon: <Check className="w-5 h-5 text-brand-neon" /> }))
    : MOCK_AMENITIES;

  return (
    <div className="py-8">
      <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tighter">
        <div className="w-2 h-8 bg-brand-neon rounded-full shadow-glow" />
        Premium Amenities
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAmenities.map((amenity, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-brand-neon/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-neon/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner-glow">
              {amenity.icon}
            </div>
            <span className="font-bold text-white tracking-tight text-sm">
              {amenity.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesSection;
