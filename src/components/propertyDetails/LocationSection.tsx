import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationSectionProps {
  address: string;
  landmarks?: string[];
}

const MOCK_LANDMARKS = [
  'International Airport - 45 mins',
  'City Center Mall - 10 mins',
  'Metro Station - 5 mins',
  'Global Tech Park - 15 mins'
];

const LocationSection: React.FC<LocationSectionProps> = ({ address, landmarks }) => {
  const displayLandmarks = landmarks && landmarks.length > 0 ? landmarks : MOCK_LANDMARKS;

  return (
    <div className="py-10 space-y-10">
      <h3 className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Geospatial Connectivity</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-10">
          <div className="flex items-start gap-4 text-white">
            <div className="w-12 h-12 bg-brand-neon/10 rounded-2xl flex items-center justify-center text-brand-neon shrink-0">
               <MapPin size={24} />
            </div>
            <span className="text-xl font-black tracking-tight leading-relaxed">{address}</span>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-3">
              <Navigation className="w-4 h-4 text-brand-neon" />
              Strategic Proximity
            </h4>
            <ul className="space-y-4">
              {displayLandmarks.map((landmark, idx) => (
                <li key={idx} className="flex items-center gap-4 text-brand-secondary group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-neon shadow-glow group-hover:scale-150 transition-transform"></div>
                  <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">{landmark}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="w-full h-[350px] md:h-[450px] bg-brand-deep rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-glow-lg">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20 grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-brand-neon text-white rounded-[2rem] flex items-center justify-center shadow-glow animate-pulse">
                <MapPin className="w-10 h-10" />
              </div>
              <button className="bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-3.5 rounded-2xl font-black text-[10px] text-white uppercase tracking-[0.3em] hover:bg-brand-neon hover:border-brand-neon transition-all shadow-2xl">
                Initialize Global View
              </button>
            </div>
            
            <div className="absolute bottom-6 right-8 text-[8px] font-black text-white/40 uppercase tracking-widest">
                Lat: 28.6139 | Long: 77.2090
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
