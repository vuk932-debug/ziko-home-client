import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit, Loader2, Search, ExternalLink, ShieldAlert, Building2, RotateCcw, Eye, EyeOff, ChevronDown, Star } from 'lucide-react';
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PropertyFormModal from '../../components/property/PropertyFormModal';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  status: string;
  planType: 'STANDARD' | 'PREMIUM' | 'PRO';
  isDeleted: boolean;
  isFeatured?: boolean;
  cpId?: { name: string; email: string };
  seller?: { name: string; email: string };
  images?: { id: string; url: string }[];
  amenities?: { name: string }[];
  createdAt: string;
}

const AdminProperties = () => {
  const { user } = useAuth();
  const { showNotification, confirm } = useNotification();
  const { subscription } = useOutletContext<{ subscription?: any }>() || {};
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const isCP = user?.role === 'CP';
  const isSubscribed = !isCP || (subscription && subscription.active);
  const isLimitReached = isCP && subscription && subscription.active && subscription.listingsCount >= subscription.listingLimit;

  useEffect(() => {
    fetchProperties();
  }, [showDeleted]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const endpoint = isCP ? '/cp/properties' : `/admin/properties?showDeleted=${showDeleted}`;
      const { data } = await apiClient.get(endpoint);
      setProperties(data.properties || data);
    } catch (err) {
      console.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: any) => {
    setSelectedProperty(prop);
    setIsModalOpen(true);
  };

  const handlePlanChange = async (propertyId: string, newPlan: string) => {
    if (isCP) return;
    try {
      await apiClient.patch(`/admin/properties/${propertyId}/plan`, { planType: newPlan });
      setProperties(properties.map(p => p.id === propertyId ? { ...p, planType: newPlan as any } : p));
      showNotification('success', 'Plan tier updated successfully');
    } catch (err) {
      showNotification('error', 'Failed to update plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSubscribed && isCP) return;
    const confirmed = await confirm({ 
      title: 'Decommission Asset',
      message: 'This operation will mark the asset as deleted. Proceed with decommission?',
      type: 'danger',
      confirmText: 'Decommission'
    });
    if (!confirmed) return;
    try {
      const endpoint = isCP ? `/cp/properties/${id}` : `/admin/properties/${id}`;
      await apiClient.delete(endpoint);
      if (!isCP && showDeleted) {
         setProperties(properties.map(p => p.id === id ? { ...p, isDeleted: true } : p));
      } else {
         setProperties(properties.filter(p => p.id !== id));
      }
      showNotification('success', 'Asset decommissioned');
    } catch (err) {
      showNotification('error', 'Failed to delete property');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await apiClient.patch(`/admin/properties/${id}/restore`);
      setProperties(properties.map(p => p.id === id ? { ...p, isDeleted: false } : p));
      showNotification('success', 'Asset restored to active inventory');
    } catch (err) {
      showNotification('error', 'Failed to restore property');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (isCP) return;
    try {
      await apiClient.put(`/properties/${id}/status`, { status: newStatus });
      setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showNotification('success', `Status updated to ${newStatus}`);
    } catch (err) {
      showNotification('error', 'Failed to update status');
    }
  };

  const handleTogglePriority = async (id: string, currentPriority: boolean) => {
    if (isCP) return;
    try {
      await apiClient.put(`/admin/properties/${id}/feature`, { featured: !currentPriority });
      setProperties(properties.map(p => p.id === id ? { ...p, isFeatured: !currentPriority } : p));
      showNotification('success', `Asset marked as ${!currentPriority ? 'Priority' : 'Standard'}`);
    } catch (err) {
      showNotification('error', 'Failed to update priority status');
    }
  };

  const filtered = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Assets...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Building2 className="w-3 h-3" />
            Inventory Protocol
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {isCP ? (
              <>Asset <span className="text-brand-neon neon-text">Catalog</span></>
            ) : (
              <>Listing <span className="text-brand-neon neon-text">Moderation</span></>
            )}
          </h1>
          <p className="text-brand-secondary font-medium opacity-70">
            {isCP ? 'Manage your property listings and real-time inventory.' : 'Full administrative control over all platform assets.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon w-4 h-4 transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!isCP && (
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${
                showDeleted ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-brand-secondary'
              }`}
            >
              {showDeleted ? <EyeOff size={16} /> : <Eye size={16} />}
              {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
            </button>
          )}

          <button 
            disabled={!isSubscribed || isLimitReached}
            onClick={openAddModal}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              (isSubscribed && !isLimitReached)
                ? 'bg-brand-neon text-white shadow-glow hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-brand-secondary cursor-not-allowed border border-white/5'
            }`}
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      {isLimitReached && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-amber-500 animate-slide-up shadow-glow">
          <ShieldAlert size={24} className="shrink-0" />
          <div>
            <span className="text-xs font-black uppercase tracking-widest block mb-1">Bandwidth Exhausted</span>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              You have reached your listing limit slots. Upgrade to expand your catalog.
            </span>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Asset Details</th>
                {!isCP && <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Partner Identity</th>}
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Plan Tier</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Status</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60 text-right">System Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((prop) => (
                <tr key={prop.id} className={`hover:bg-white/5 transition-colors group ${prop.isDeleted ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="text-white font-black text-lg tracking-tight group-hover:text-brand-neon transition-colors line-clamp-1">
                          {prop.title}
                          {prop.isDeleted && <span className="ml-3 text-[9px] bg-red-500 text-white px-2 py-0.5 rounded uppercase">Deleted</span>}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest mt-1.5 opacity-60">{prop.location}, {prop.city} • ₹{(prop.price/100000).toFixed(1)}L</div>
                      </div>
                    </div>
                  </td>
                  {!isCP && (
                    <td className="px-8 py-6">
                      <div className="text-white font-bold text-sm">{(prop.cpId || prop.seller)?.name || 'System'}</div>
                      <div className="text-[10px] text-brand-secondary font-medium opacity-60 mt-1 uppercase tracking-widest">{(prop.cpId || prop.seller)?.email || 'internal@platform.com'}</div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="relative inline-block w-32">
                      <select 
                        disabled={isCP || prop.isDeleted}
                        value={prop.planType} 
                        onChange={(e) => handlePlanChange(prop.id, e.target.value)}
                        className={`w-full text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2 border transition-all ${
                          prop.planType === 'PRO' ? 'bg-brand-accent/20 border-brand-accent/50 text-brand-accent shadow-glow' :
                          prop.planType === 'PREMIUM' ? 'bg-brand-neon/20 border-brand-neon/50 text-brand-neon shadow-glow' :
                          'bg-white/5 border-white/10 text-brand-secondary'
                        } ${isCP || prop.isDeleted ? 'appearance-none' : 'cursor-pointer hover:border-white/30'} focus:outline-none`}
                      >
                        <option value="STANDARD" className="bg-brand-bg text-white">Standard</option>
                        <option value="PREMIUM" className="bg-brand-bg text-white">Premium</option>
                        <option value="PRO" className="bg-brand-bg text-white">Pro</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {isCP || prop.isDeleted ? (
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                        prop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${prop.status === 'approved' ? 'bg-emerald-500 shadow-glow' : 'bg-amber-500'}`} />
                        {prop.status}
                      </span>
                    ) : (
                      <div className="relative inline-block">
                        <select 
                          value={prop.status} 
                          onChange={(e) => handleStatusUpdate(prop.id, e.target.value)}
                          className={`text-[9px] font-black uppercase tracking-widest rounded-full px-4 py-1.5 border outline-none cursor-pointer transition-all appearance-none pr-8 ${
                            prop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 
                            prop.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                        >
                          <option value="pending" className="bg-brand-bg text-white">Pending</option>
                          <option value="approved" className="bg-brand-bg text-white">Approved</option>
                          <option value="rejected" className="bg-brand-bg text-white">Rejected</option>
                          <option value="sold" className="bg-brand-bg text-white">Sold</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={10} />
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 transition-all duration-300">
                      {prop.isDeleted ? (
                        <button 
                          onClick={() => handleRestore(prop.id)}
                          className="p-3 rounded-xl transition-all border text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                          title="Restore Asset"
                        >
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <>
                          {!isCP && (
                            <button 
                              onClick={() => handleTogglePriority(prop.id, prop.isFeatured || false)}
                              className={`p-3 rounded-xl transition-all border ${
                                prop.isFeatured 
                                  ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' 
                                  : 'text-brand-secondary bg-white/5 border-white/5 hover:border-brand-neon/20 hover:bg-brand-neon/10 hover:text-brand-neon'
                              }`}
                              title={prop.isFeatured ? "Remove Priority" : "Mark as Priority"}
                            >
                              <Star size={16} className={prop.isFeatured ? "fill-amber-500" : ""} />
                            </button>
                          )}
                          <button 
                            disabled={!isSubscribed}
                            onClick={() => openEditModal(prop)}
                            className={`p-3 rounded-xl transition-all border ${
                              isSubscribed 
                                ? 'text-brand-secondary hover:text-brand-neon bg-white/5 border-white/5 hover:border-brand-neon/20 hover:bg-brand-neon/10' 
                                : 'text-white/5 cursor-not-allowed border-transparent'
                            }`}
                            title="Edit Asset"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            disabled={!isSubscribed}
                            onClick={() => isSubscribed && handleDelete(prop.id)} 
                            className={`p-3 rounded-xl transition-all border ${
                              isSubscribed 
                                ? 'text-brand-secondary hover:text-red-400 bg-white/5 border-white/5 hover:border-red-400/20 hover:bg-red-400/10' 
                                : 'text-white/5 cursor-not-allowed border-transparent'
                            }`}
                            title="Purge Asset"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <a 
                        href={`/property/${prop.id}`}
                        target="_blank"
                        className="p-3 text-brand-secondary hover:text-brand-accent bg-white/5 border border-white/5 hover:border-brand-accent/20 hover:bg-brand-accent/10 rounded-xl transition-all"
                        title="View Live"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <ShieldAlert className="w-10 h-10 text-brand-secondary opacity-20" />
             </div>
             <p className="text-brand-secondary font-black text-xs uppercase tracking-widest opacity-60">No matching assets found in local catalog.</p>
          </div>
        )}
      </div>

      <PropertyFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProperties}
        property={selectedProperty}
      />
    </div>
  );
};

export default AdminProperties;
