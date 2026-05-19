import React from 'react';

interface PropertyOverviewProps {
  text: string;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="py-10">
      <h3 className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Asset Intelligence</h3>
      <p className="text-brand-secondary leading-relaxed text-lg md:text-xl font-medium max-w-4xl opacity-80">
        {text}
      </p>
    </div>
  );
};

export default PropertyOverview;

