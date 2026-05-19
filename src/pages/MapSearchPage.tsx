import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Zap, ChevronRight, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/common/PropertyCard';
import { useAuth } from '../context/AuthContext';

const defaultCenter = { lat: 40.7128, lng: -74.0060 };

const mockProperties = [
  { id: '1', slug: 'downtown-penthouse', title: 'Downtown Penthouse Sky', price: 1250000, location: 'Financial District', city: 'NY', bedrooms: 3, bathrooms: 2, area: 2400, images: [], featured: true, sellerId: { name: 'J. Doe', isVerified: true }, coordinates: { lat: 40.7128, lng: -74.0060 } },
  { id: '2', slug: 'suburban-villa', title: 'Sleek Suburban Villa', price: 850000, location: 'Queens', city: 'NY', bedrooms: 4, bathrooms: 3, area: 3200, images: [], featured: false, sellerId: { name: 'A. Smith' }, coordinates: { lat: 40.7282, lng: -73.7949 } }
];

const MapSearchPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties] = useState<any[]>(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const restrictedRoles = ['Admin', 'CP', 'WRITER'];
      if (restrictedRoles.includes(user.role)) {
        if (user.role === 'Admin') navigate('/admin', { replace: true });
        else if (user.role === 'CP') navigate('/cp', { replace: true });
        else if (user.role === 'WRITER') navigate('/writer/dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  if (loadError) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-center">
      <div className="glass-card p-10 rounded-[2rem] border-white/10 max-w-md">
        <Zap className="w-12 h-12 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">Mapping Failure</h2>
        <p className="text-brand-secondary font-medium opacity-60">The global grid could not be established. Verify mapping credentials.</p>
      </div>
    </div>
  );

  return (
    <div className="pt-24 h-screen flex flex-col md:flex-row overflow-hidden bg-brand-bg transition-colors">
      
      {/* Left List Container */}
      <div className="w-full md:w-1/2 lg:w-[55%] h-full overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
              <MapPin className="w-3 h-3" />
              Geospatial Search
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Properties in <span className="text-brand-neon neon-text">New York</span></h1>
            <p className="text-brand-secondary font-medium opacity-60">{properties.length} verified assets mapped on the network.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative inline-block">
                <select className="bg-white/5 border border-white/5 text-brand-secondary text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl outline-none focus:ring-1 focus:ring-brand-neon appearance-none cursor-pointer pr-12 hover:bg-white/10 transition-all">
                    <option className="bg-brand-deep">Recency</option>
                    <option className="bg-brand-deep">Value: High → Low</option>
                    <option className="bg-brand-deep">Value: Low → High</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-secondary pointer-events-none" />
             </div>
             <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-brand-secondary hover:text-brand-neon transition-all">
                <SlidersHorizontal size={18} />
             </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-20">
          {properties.map(prop => (
             <div 
               key={prop.id} 
               onMouseEnter={() => setSelectedProperty(prop)}
               className={`transition-all duration-500 ${selectedProperty?.id === prop.id ? 'scale-[1.02] z-10' : 'opacity-80 grayscale-[20%]'}`}
             >
                <PropertyCard property={prop} />
             </div>
          ))}
        </div>

        {/* Decorative Gradient Overlay */}
        <div className="fixed bottom-0 left-0 w-full md:w-[55%] h-32 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none z-20" />
      </div>

      {/* Right Map Layout */}
      <div className="hidden md:block md:w-1/2 lg:w-[45%] h-full relative border-l border-white/5 bg-brand-deep/20">
         {!isLoaded ? (
           <div className="h-full w-full bg-brand-bg/50 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-12 h-12 text-brand-neon animate-spin shadow-glow" />
             <span className="text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em] opacity-40">Initializing Engine...</span>
           </div>
         ) : (
           <div className="h-full w-full relative">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                zoom={11}
                center={defaultCenter}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: false,
                }}
              >
                {properties.map((prop) => (
                    <Marker
                      key={prop.id}
                      position={{ lat: prop.coordinates.lat, lng: prop.coordinates.lng }}
                      onClick={() => setSelectedProperty(prop)}
                      icon={{
                        url: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238B5CF6' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E",
                        scaledSize: new window.google.maps.Size(44, 44)
                      }}
                    />
                ))}

                {selectedProperty && (
                  <InfoWindow
                    position={{ lat: selectedProperty.coordinates.lat, lng: selectedProperty.coordinates.lng }}
                    onCloseClick={() => setSelectedProperty(null)}
                  >
                    <div className="p-4 min-w-[200px] bg-brand-deep text-white border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                           <Sparkles className="w-3 h-3 text-brand-neon" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-brand-neon">Featured Asset</span>
                        </div>
                        <p className="font-black text-sm line-clamp-1 tracking-tight">{selectedProperty.title}</p>
                        <p className="text-brand-accent font-black mt-1 text-lg tracking-tighter">${selectedProperty.price.toLocaleString()}</p>
                        <button className="w-full mt-4 py-2 bg-brand-neon text-white text-[10px] font-black uppercase tracking-widest rounded-lg">View Profile</button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
              
              {/* Map Controls */}
              <div className="absolute bottom-10 right-8 flex flex-col gap-3">
                 <button className="w-12 h-12 glass-card border-white/10 rounded-2xl flex items-center justify-center text-white hover:text-brand-neon hover:border-brand-neon/40 transition-all shadow-glow-lg">
                    <Zap size={20} />
                 </button>
              </div>
           </div>
         )}
      </div>

    </div>
  );
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0B0B1F" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B0B1F" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#C4C4DD" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#8B5CF6" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#C4C4DD" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1A0F3C" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#12122A" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1A0F3C" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8A8AA3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

export default MapSearchPage;

