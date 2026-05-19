import React from 'react';
import { BedDouble, Maximize, Home, Calendar, Clock } from 'lucide-react';

interface PropertySpecsProps {
  bhk: number | null;
  areaSqft: number;
  propertyType: string;
  startYear?: string;
  completionTimeline?: string;
}

const PropertySpecs: React.FC<PropertySpecsProps> = ({
  bhk,
  areaSqft,
  propertyType,
  startYear = '2024',
  completionTimeline = 'Ready to Move',
}) => {
  const specs = [
    ...(bhk !== null
      ? [
          {
            icon: <BedDouble className="w-6 h-6 text-brand-neon" />,
            label: 'Capacity',
            value: `${bhk} BHK`,
          },
        ]
      : []),
    {
      icon: <Maximize className="w-6 h-6 text-brand-neon" />,
      label: 'Footprint',
      value: `${areaSqft} sqft`,
    },
    {
      icon: <Home className="w-6 h-6 text-brand-neon" />,
      label: 'Category',
      value: propertyType.replace(/_/g, ' ').toLowerCase(),
      capitalize: true,
    },
    {
      icon: <Calendar className="w-6 h-6 text-brand-neon" />,
      label: 'Inception',
      value: startYear,
    },
    {
      icon: <Clock className="w-6 h-6 text-brand-neon" />,
      label: 'Availability',
      value: completionTimeline,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-10">
      {specs.map((spec, idx) => (
        <div 
          key={idx} 
          className="flex flex-col items-start gap-5 p-6 rounded-[2rem] glass-card border-white/5 hover:border-brand-neon/20 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:shadow-glow transition-all">
            {spec.icon}
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] text-brand-secondary font-black uppercase tracking-widest opacity-60">
              {spec.label}
            </span>
            <span className={`block font-black text-white text-lg tracking-tight ${spec.capitalize ? 'capitalize' : ''}`}>
              {spec.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertySpecs;

