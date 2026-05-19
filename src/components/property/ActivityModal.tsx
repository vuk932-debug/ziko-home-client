import { useState, useEffect } from 'react';
import { X, Building2, MessageSquare, Loader2, Activity, Zap } from 'lucide-react';
import apiClient from '../../api/axios';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const ActivityModal = ({ isOpen, onClose, clientId, clientName }: ActivityModalProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ propertiesCount: number; leadsCount: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchActivity();
    }
  }, [isOpen, clientId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/admin/clients/${clientId}/activity`);
      setData(data);
    } catch (err) {
      console.error('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-bg/80 backdrop-blur-xl">
      <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-glow-lg animate-slide-up">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-neon/10 rounded-xl flex items-center justify-center text-brand-neon">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Intelligence Log</h2>
              <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest opacity-60">Real-time Node Metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-secondary"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white transform group-hover:scale-110 transition-transform">
                <Building2 size={48} />
            </div>
            <div className="w-14 h-14 bg-brand-neon/10 rounded-2xl flex items-center justify-center text-brand-neon relative z-10">
              <Building2 size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Total Listings</p>
              <div className="flex items-baseline gap-2 mt-1">
                {loading ? <Loader2 className="animate-spin text-white w-4 h-4" /> : <span className="text-3xl font-black text-white">{data?.propertiesCount}</span>}
                <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest opacity-40">Assets</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white transform group-hover:scale-110 transition-transform">
                <MessageSquare size={48} />
            </div>
            <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent relative z-10">
              <MessageSquare size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Leads Captured</p>
              <div className="flex items-baseline gap-2 mt-1">
                {loading ? <Loader2 className="animate-spin text-white w-4 h-4" /> : <span className="text-3xl font-black text-white">{data?.leadsCount}</span>}
                <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest opacity-40">Acquisitions</span>
              </div>
            </div>
          </div>

          <div className="bg-hero-gradient p-8 rounded-[2rem] text-center space-y-4">
             <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto text-white">
                <Zap size={24} className="animate-pulse"/>
             </div>
             <div>
                <p className="text-white font-black text-lg tracking-tight">{clientName}</p>
                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-1">Authorized Partner Node</p>
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-white/5">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
          >
            Acknowledge Intelligence
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
