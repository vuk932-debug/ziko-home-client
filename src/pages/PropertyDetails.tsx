import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight,
  Phone,
  Loader2,
  ShieldCheck,
  Building2,
  Info,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import apiClient from '../api/axios';
import PropertyHeader from '../components/propertyDetails/PropertyHeader';
import ImageGallery from '../components/propertyDetails/ImageGallery';
import PropertyOverview from '../components/propertyDetails/PropertyOverview';
import PropertySpecs from '../components/propertyDetails/PropertySpecs';
import AmenitiesSection from '../components/propertyDetails/AmenitiesSection';
import LocationSection from '../components/propertyDetails/LocationSection';
import LeadCaptureModal from '../components/property/LeadCaptureModal';
import EngagementButtons from '../components/common/EngagementButtons';

const CATEGORY_DISPLAY: Record<string, string> = {
  NEW_PROJECT: 'New Projects',
  READY_TO_MOVE: 'Ready to Move In',
  UNDER_CONSTRUCTION: 'Under Construction',
  RESALE: 'Secondary Property',
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadSource, setLeadSource] = useState('contact_agent');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await apiClient.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const openLeadModal = (source: string) => {
    setLeadSource(source);
    setIsLeadModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-brand-neon animate-spin shadow-glow" />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center glass-card p-12 rounded-[2.5rem] border-white/10">
        <h1 className="text-3xl font-black text-white mb-6">Asset Not Located</h1>
        <Link to="/properties" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-brand-bg min-h-screen pb-32 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-12 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-brand-neon transition-colors">Home</Link>
          <ChevronRight size={12} className="text-brand-muted" />
          <Link to="/properties" className="hover:text-brand-neon transition-colors">Catalog</Link>
          <ChevronRight size={12} className="text-brand-muted" />
          <span className="text-brand-neon truncate">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            <div className="glass-card rounded-[2.5rem] p-1 overflow-hidden border-white/5">
               <ImageGallery images={property.images} title={property.title} />
            </div>
            
            <div className="space-y-12 px-2">
              <PropertyHeader 
                title={property.title} 
                locationArea={property.location} 
                locationCity={property.city} 
                priceLabel={property.priceLabel} 
              />
              <div className="h-[1px] bg-white/5 w-full" />
              <PropertySpecs 
                bhk={property.bedrooms} 
                areaSqft={property.area} 
                propertyType={property.type || 'Residential'} 
              />
              <div className="h-[1px] bg-white/5 w-full" />
              <PropertyOverview text={property.description} />
              <div className="h-[1px] bg-white/5 w-full" />
              <AmenitiesSection amenities={property.amenities} />
              <div className="h-[1px] bg-white/5 w-full" />
              <LocationSection address={property.location + ', ' + property.city} />
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            <div className="bg-brand-deep/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 sticky top-32 shadow-glow-lg">
               <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    {property.isFeatured && (
                      <span className="bg-brand-neon text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-glow flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    <span className="bg-brand-deep/60 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      {CATEGORY_DISPLAY[property.category] || property.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-5xl font-black text-white tracking-tighter">
                    {property.priceLabel}
                  </div>
                  <p className="text-brand-muted text-xs font-bold mt-2 uppercase tracking-[0.2em]">Guaranteed Market Price</p>
               </div>

               <div className="space-y-6 mb-10">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-brand-neon/30 transition-all duration-500">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-neon/10 rounded-2xl flex items-center justify-center text-brand-neon group-hover:shadow-glow transition-all">
                           <Building2 size={28} />
                        </div>
                        <div>
                           <div className="text-[10px] text-brand-muted font-black uppercase tracking-[0.2em] mb-1">Asset Custodian</div>
                           <div className="text-white font-black text-lg">{property.seller?.name || 'Ziko Partner'}</div>
                        </div>
                     </div>
                  </div>

                  {property.seller?.isVerified && (
                    <div className="flex items-center gap-3 px-5 py-3 bg-brand-neon/10 text-brand-neon rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-brand-neon/20 shadow-glow">
                       <ShieldCheck size={16} />
                       Verified Ziko Global Partner
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => openLeadModal('contact_agent')}
                    className="btn-primary w-full !py-5 flex items-center justify-center gap-3 text-sm"
                  >
                    <Phone size={18} />
                    Contact Agent
                  </button>
                  <button 
                    onClick={() => openLeadModal('schedule_inspection')}
                    className="btn-outline w-full !py-5 flex items-center justify-center gap-3 text-sm"
                  >
                    <CalendarDays size={18} />
                    Schedule Inspection
                  </button>
               </div>

               <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center">
                  <EngagementButtons 
                    entityId={property.id} 
                    entityType="PROPERTY" 
                    slug={property.id} 
                    title={property.title} 
                  />
               </div>
            </div>

            <div className="bg-brand-accent/5 rounded-[2rem] p-8 border border-brand-accent/20">
               <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                    <Info className="text-brand-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="text-brand-accent font-black text-xs uppercase tracking-widest mb-2">Protocol Advisory</h4>
                    <p className="text-brand-secondary/70 text-xs leading-relaxed font-bold opacity-80">
                      Ziko Home protocols mandate physical site inspection and document 
                      verification before any credit transfer.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <LeadCaptureModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
        propertyId={property.id} 
        propertyName={property.title} 
        source={leadSource}
      />
    </div>
  );
};

export default PropertyDetails;
