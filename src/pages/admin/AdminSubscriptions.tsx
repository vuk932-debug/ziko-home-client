import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Calendar, User, ShieldCheck, Sparkles, Zap, ChevronRight } from 'lucide-react';
import apiClient from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

interface CPUser {
  id: string;
  name: string;
  email: string;
  agentId: string;
}

const AdminSubscriptions = () => {
  const { showNotification } = useNotification();
  const [cps, setCps] = useState<CPUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [selectedCp, setSelectedCp] = useState('');
  const [planType, setPlanType] = useState('STANDARD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCPs();
  }, []);

  const fetchCPs = async () => {
    try {
      const { data } = await apiClient.get('/admin/users');
      const cpUsers = data.filter((u: any) => u.role === 'CP');
      setCps(cpUsers);
    } catch (err) {
      console.error('Failed to fetch Channel Partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      await apiClient.post('/subscriptions/assign', {
        userId: selectedCp,
        planType,
        startDate,
        endDate
      });
      setSuccess(true);
      setSelectedCp('');
      setEndDate('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to assign subscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Plans...</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
          <Zap className="w-3 h-3" />
          Monetization Engine
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Subscription <span className="text-brand-neon neon-text">Control</span></h1>
        <p className="text-brand-secondary font-medium opacity-70 max-w-xl mx-auto">Authorize platform bandwidth and assign listing quotas to global channel partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanTierCard title="Standard" limit="200 Assets" icon={<ShieldCheck size={24} />} color="text-brand-secondary" glow="shadow-[0_0_20px_rgba(196,196,221,0.1)]" />
        <PlanTierCard title="Pro" limit="35 Assets" icon={<Zap size={24} />} color="text-brand-accent" glow="shadow-glow" active />
        <PlanTierCard title="Premium" limit="150 Assets" icon={<Sparkles size={24} />} color="text-brand-neon" glow="shadow-glow-lg" />
      </div>

      <div className="glass-card border-white/10 rounded-[3rem] overflow-hidden shadow-glow-lg relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full filter blur-[80px]" />
        
        <div className="p-10 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <User size={14} className="text-brand-neon" /> Channel Partner Identity
                </label>
                <div className="relative">
                  <select 
                    required
                    value={selectedCp}
                    onChange={e => setSelectedCp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-brand-bg text-white">Select identity...</option>
                    {cps.map(cp => (
                      <option key={cp.id} value={cp.id} className="bg-brand-bg text-white">
                        {cp.name} ({cp.agentId || cp.email})
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-secondary pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <CreditCard size={14} className="text-brand-accent" /> Bandwidth Tier
                </label>
                <div className="relative">
                  <select 
                    required
                    value={planType}
                    onChange={e => setPlanType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all appearance-none cursor-pointer"
                  >
                    <option value="STANDARD" className="bg-brand-deep">Standard (200 Assets)</option>
                    <option value="PRO" className="bg-brand-deep">Pro (35 Assets)</option>
                    <option value="PREMIUM" className="bg-brand-deep">Premium (150 Assets)</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-secondary pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={14} className="text-brand-neon" /> Protocol Start
                </label>
                <input 
                  required
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={14} className="text-brand-accent" /> Protocol Termination
                </label>
                <input 
                  required
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                />
              </div>
            </div>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[1.5rem] flex items-center gap-4 text-emerald-500 animate-slide-up">
                <ShieldCheck size={24} />
                <span className="text-xs font-black uppercase tracking-widest">Subscription Protocol Successfully Encrypted.</span>
              </div>
            )}

            <button 
              disabled={submitting}
              type="submit"
              className="w-full py-5 bg-brand-neon hover:bg-brand-accent disabled:opacity-50 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-glow flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Subscription Access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PlanTierCard = ({ title, limit, icon, color, glow, active }: any) => (
  <div className={`glass-card border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 ${active ? 'border-brand-neon/30 ' + glow : 'hover:border-white/20'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${active ? 'bg-brand-neon/20 ' + color : 'bg-white/5 text-brand-secondary group-hover:bg-white/10'}`}>
      {icon}
    </div>
    <h3 className="text-white font-black text-xl tracking-tight mb-1">{title}</h3>
    <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-60">{limit}</p>
    {active && (
      <div className="absolute top-4 right-4">
        <span className="bg-brand-neon text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-glow">Active Tier</span>
      </div>
    )}
  </div>
);

export default AdminSubscriptions;
