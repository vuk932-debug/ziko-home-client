import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Trash2, CheckCircle2, ChevronDown, MapPin, Info, Tag } from 'lucide-react';
import apiClient from '../../api/axios';
import ImageGalleryManager from './ImageGalleryManager';
import { useAuth } from '../../context/AuthContext';
import { propertySchema } from '../../shared/schemas/property.schema';
import { COUNTRIES, splitPhone } from '../../shared/utils/countries';
import LocationSelector from '../common/LocationSelector';
import { useNotification } from '../../context/NotificationContext';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property?: any; // If editing
}

const PropertyFormModal = ({ isOpen, onClose, onSuccess, property }: PropertyFormProps) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const isCP = user?.role === 'CP' || user?.role === 'Channel Partner';

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    country: '',
    city: '',
    state: '',
    pincode: '',
    propertyType: 'APARTMENT',
    category: 'READY_TO_MOVE',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    description: '',
    amenities: '',
    contactPrefix: '+91',
    contactNumber: '',
    sellerId: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [cps, setCps] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'Admin' && isOpen) {
      fetchCPs();
    }
  }, [isOpen, user]);

  const fetchCPs = async () => {
    try {
      const { data } = await apiClient.get('/admin/clients?limit=100');
      setCps(data.clients || []);
    } catch (err) {
      console.error('Failed to fetch partners');
    }
  };

  useEffect(() => {
    if (property) {
      const phoneData = splitPhone(property.contactNumber);
      setFormData({
        title: property.title || '',
        price: property.price?.toString() || '',
        location: property.location || '',
        country: property.country || '',
        city: property.city || '',
        state: property.state || '',
        pincode: property.pincode || '',
        propertyType: property.propertyType || 'APARTMENT',
        category: property.category || 'READY_TO_MOVE',
        bedrooms: property.bedrooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1',
        area: property.area?.toString() || '',
        description: property.description || '',
        amenities: property.amenities?.map((a: any) => a.name).join(', ') || '',
        contactPrefix: phoneData.prefix,
        contactNumber: phoneData.number,
        sellerId: property.sellerId || ''
      });
      setExistingImages(property.images || []);
    } else {
      setFormData({
        title: '',
        price: '',
        location: '',
        country: '',
        city: '',
        state: '',
        pincode: '',
        propertyType: 'APARTMENT',
        category: 'READY_TO_MOVE',
        bedrooms: '1',
        bathrooms: '1',
        area: '',
        description: '',
        amenities: '',
        contactPrefix: '+91',
        contactNumber: '',
        sellerId: ''
      });
      setExistingImages([]);
    }
    setImages([]);
    setPreviews([]);
  }, [property, isOpen]);

  const fetchPropertyLatest = async () => {
    if (!property?.slug) return;
    try {
      const { data } = await apiClient.get('/properties/' + property.slug);
      setExistingImages(data.images || []);
    } catch (err) {
      console.error('Failed to sync images');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
        ...formData,
        contactNumber: formData.contactNumber ? `${formData.contactPrefix}${formData.contactNumber}` : ''
    };

    // Validate with Zod
    const validation = propertySchema.safeParse(submissionData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      showNotification('error', firstError);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key === 'sellerId' && !value) return; // Skip empty sellerId
        if (key === 'contactPrefix') return;
        data.append(key, value as string);
      });
      images.forEach(image => data.append('images', image));

      if (property) {
        const endpoint = isCP ? `/cp/properties/${property.id}` : `/admin/properties/${property.id}`;
        await apiClient.put(endpoint, data);
      } else {
        const endpoint = isCP ? '/properties' : '/admin/properties';
        await apiClient.post(endpoint, data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      const displayMessage = Array.isArray(errorMessage) 
        ? (errorMessage[0]?.message || 'Server validation error')
        : (errorMessage || 'Failed to save property');
      showNotification('error', displayMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/90 backdrop-blur-2xl overflow-y-auto">
      <div className="glass-card rounded-[3rem] border-white/10 w-full max-w-4xl my-auto overflow-hidden shadow-glow-lg animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              {property ? (
                <>Edit <span className="text-brand-neon">Asset</span></>
              ) : (
                <>New <span className="text-brand-neon">Listing</span></>
              )}
            </h2>
            <p className="text-[10px] font-bold text-brand-secondary mt-1 uppercase tracking-[0.3em] opacity-60">Inventory Synchronization Protocol</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-brand-secondary hover:text-white border border-transparent hover:border-white/10"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
            {/* Administrative Overrides */}
            {user?.role === 'Admin' && !property && (
              <div className="space-y-8">
                <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                  Administrative Routing
                </h3>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Assign to Partner Node (Mandatory)</label>
                  <div className="relative group">
                    <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer"
                      value={formData.sellerId} onChange={e => setFormData({...formData, sellerId: e.target.value})}>
                      <option value="" className="bg-brand-bg text-white">Select partner...</option>
                      {cps.map(cp => (
                        <option key={cp.id} value={cp.id} className="bg-brand-bg text-white">{cp.name} ({cp.agentId})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            )}

            {/* Basic Details */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                Primary Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">
                    <Tag size={12} className="text-brand-neon" /> Asset Title
                  </label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. SKYLINE PENTHOUSE X1"/>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">
                    ₹ Market Value
                  </label>
                  <input required type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20 font-mono" 
                    value={formData.price} onKeyDown={(e) => ['-', 'e', 'E'].includes(e.key) && e.preventDefault()} onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) {
                        setFormData({...formData, price: val});
                      }
                    }} placeholder="7500000"/>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                Structural Configuration
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Asset Class</label>
                  <div className="relative group">
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer"
                      value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})}>
                      <option value="APARTMENT" className="bg-brand-bg text-white">Apartment</option>
                      <option value="VILLA" className="bg-brand-bg text-white">Villa</option>
                      <option value="INDEPENDENT_HOUSE" className="bg-brand-bg text-white">House</option>
                      <option value="PLOT" className="bg-brand-bg text-white">Plot</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Listing Category</label>
                  <div className="relative group">
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer"
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="NEW_PROJECT" className="bg-brand-bg text-white">New Projects</option>
                      <option value="READY_TO_MOVE" className="bg-brand-bg text-white">Ready to Move In</option>
                      <option value="UNDER_CONSTRUCTION" className="bg-brand-bg text-white">Under Construction</option>
                      <option value="RESALE" className="bg-brand-bg text-white">Secondary Property</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">BHK Units</label>
                  <input required type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono" 
                    value={formData.bedrooms} onKeyDown={(e) => ['-', 'e', 'E', '.'].includes(e.key) && e.preventDefault()} onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setFormData({...formData, bedrooms: val});
                      }
                    }}/>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Washrooms</label>
                  <input required type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono" 
                    value={formData.bathrooms} onKeyDown={(e) => ['-', 'e', 'E', '.'].includes(e.key) && e.preventDefault()} onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setFormData({...formData, bathrooms: val});
                      }
                    }}/>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Surface Area</label>
                  <div className="relative">
                    <input required type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono" 
                      value={formData.area} onKeyDown={(e) => ['-', 'e', 'E'].includes(e.key) && e.preventDefault()} onChange={e => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) {
                          setFormData({...formData, area: val});
                        }
                      }}/>
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-secondary opacity-40 uppercase tracking-widest">SQFT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                Geospatial Data
              </h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">
                    <MapPin size={12} className="text-brand-neon" /> Specific Vector Area (Sector/Phase)
                  </label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20" 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Phase 2, Cyber City"/>
                </div>

                <div className="space-y-6">
                  <LocationSelector 
                    values={{ country: formData.country, state: formData.state, city: formData.city }}
                    onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    inputClassName="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20"
                    optionsClassName="bg-brand-bg text-white border border-white/10 shadow-2xl backdrop-blur-3xl"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Postal Reference (Pincode)</label>
                      <input required type="text" placeholder="e.g. 560102" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono text-sm" 
                        value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-8">
               <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                 <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                 Asset Intelligence
               </h3>
               <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">
                    <Info size={12} className="text-brand-neon" /> Intelligence Overview
                  </label>
                  <textarea required rows={5} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all resize-none leading-relaxed" 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed property brief..."></textarea>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Utility Amenities (Comma Separated)</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all" 
                      value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} placeholder="Parking, Gym, Pool, Security"/>
                 </div>
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Direct Contact Override</label>
                    <div className="flex gap-2">
                      <div className="relative group w-32">
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer text-xs"
                          value={formData.contactPrefix} onChange={e => setFormData({...formData, contactPrefix: e.target.value})}>
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.prefix} className="bg-brand-bg text-white">{c.code} {c.prefix}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors pointer-events-none" size={14} />
                      </div>
                      <input type="tel" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono" 
                        value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value.replace(/\D/g, '')})} placeholder="00000 00000"/>
                    </div>
                 </div>
               </div>
            </div>

            {/* Media */}
            <div className="space-y-8">
               {property ? (
                 <ImageGalleryManager 
                   propertyId={property.id} 
                   images={existingImages} 
                   onUpdate={fetchPropertyLatest} 
                 />
               ) : (
                 <>
                   <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
                     Visual Documentation
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {previews.map((url, i) => (
                        <div key={`preview-${i}`} className="aspect-square rounded-2xl border border-white/10 overflow-hidden relative group bg-brand-deep/30">
                          <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-red-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white">
                            <Trash2 size={24} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-neon hover:bg-brand-neon/5 transition-all flex flex-col items-center justify-center cursor-pointer text-brand-secondary hover:text-brand-neon group relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Upload size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                        <span className="text-[10px] font-black mt-4 uppercase tracking-[0.2em] relative z-10">Add Module</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                   </div>
                 </>
               )}
            </div>
          </div>

          <div className="p-10 border-t border-white/5 bg-brand-card/90 backdrop-blur-xl shrink-0">
            <button disabled={loading} type="submit" className="w-full py-6 bg-brand-neon hover:bg-brand-accent disabled:opacity-50 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-glow flex items-center justify-center gap-4 group">
              {loading ? <Loader2 className="animate-spin" size={20}/> : (
                <>
                  {property ? 'Synchronize Identity' : 'Authorize Catalog Entry'}
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;
