import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Building2, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Loader2,
  Calendar,
  Sparkles,
  Zap,
  ChevronRight,
  BadgeCheck,
  RefreshCcw
} from 'lucide-react';
import apiClient from '../../api/axios';
import { format } from 'date-fns';

interface DashboardData {
  profile: {
    name: string;
    email: string;
    agentId: string;
  };
  subscription: {
    plan: string;
    endDate: string | null;
    daysRemaining: number;
    status: 'ACTIVE' | 'EXPIRED' | 'NONE';
  };
  usage: {
    totalListings: number;
    maxListings: number;
    remaining: number;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    closed: number;
  };
}

const CPDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/cp/dashboard');
      setData(data);
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Intelligence...</p>
    </div>
  );
  
  if (!data) return (
    <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-brand-secondary font-bold">Unable to synchronize dashboard metrics.</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Zap className="w-3 h-3" />
            Live Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Partner <span className="text-brand-neon neon-text">Hub</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Real-time overview of your ecosystem performance and asset metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchDashboardData}
            className="p-3 bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-brand-neon rounded-2xl border border-white/5 transition-all"
            title="Manual Synchronization"
          >
            <RefreshCcw size={18} />
          </button>
          <div className="flex items-center gap-4 text-brand-muted text-[11px] font-bold uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <Clock className="w-4 h-4 text-brand-accent animate-pulse" />
            System Time: {format(new Date(), 'HH:mm')} <span className="text-brand-accent ml-2">UTC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="glass-card border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-brand-neon/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-brand-neon/10 border border-brand-neon/20 rounded-2xl flex items-center justify-center text-brand-neon group-hover:shadow-glow transition-all">
              <User size={24} />
            </div>
            <span className="text-[10px] font-black text-brand-secondary tracking-widest uppercase opacity-40">Identity</span>
          </div>
          <h3 className="text-white font-black text-xl leading-tight group-hover:text-brand-neon transition-colors">{data.profile.name}</h3>
          <p className="text-brand-secondary text-xs mt-1 truncate opacity-60 font-medium">{data.profile.email}</p>
          <div className="mt-6 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">Agent Access Code</span>
            <div className="text-white font-mono mt-1 text-sm tracking-widest">{data.profile.agentId || 'ZH-PROVISIONAL'}</div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="glass-card border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-brand-neon/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
              data.subscription.status === 'ACTIVE' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              <CreditCard size={24} />
            </div>
            <span className="text-[10px] font-black text-brand-secondary tracking-widest uppercase opacity-40">Plan Status</span>
          </div>
          <h3 className="text-white font-black text-xl">{data.subscription.plan}</h3>
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mt-2 ${
            data.subscription.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${data.subscription.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500'}`} />
            {data.subscription.status}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Cycles Remaining</span>
              <div className="text-3xl font-black text-white mt-1">{data.subscription.daysRemaining}</div>
            </div>
            <div className="text-right">
               <Calendar size={14} className="text-brand-secondary ml-auto mb-2 opacity-40"/>
               <div className="text-[10px] text-white font-bold opacity-60 uppercase">{data.subscription.endDate ? format(new Date(data.subscription.endDate), 'MMM dd') : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Listings Usage Card */}
        <div className="glass-card border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-brand-neon/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-accent group-hover:shadow-glow transition-all">
              <Building2 size={24} />
            </div>
            <span className="text-[10px] font-black text-brand-secondary tracking-widest uppercase opacity-40">Inventory</span>
          </div>
          <h3 className="text-white font-black text-xl">{data.usage.totalListings} <span className="text-brand-secondary opacity-60">Assets</span></h3>
          <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">{data.usage.remaining} slots available</p>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
               <span className="text-brand-secondary opacity-60">Bandwidth</span>
               <span className="text-white">{Math.round((data.usage.totalListings/data.usage.maxListings)*100 || 0)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
               <div 
                 className="h-full bg-gradient-to-r from-brand-neon to-brand-accent transition-all duration-1000 shadow-glow" 
                 style={{ width: `${Math.min(100, (data.usage.totalListings/data.usage.maxListings)*100 || 0)}%` }}
               />
            </div>
          </div>
        </div>

        {/* Leads Overview Card */}
        <div className="glass-card border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-brand-neon/30 transition-all bg-hero-gradient">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <TrendingUp size={100} />
           </div>
           <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white">
              <MessageSquare size={24} />
            </div>
            <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Engagement</span>
          </div>
          <h3 className="text-4xl font-black text-white relative z-10 tracking-tighter">{data.leads.total}</h3>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">Total Acquisitions</p>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between gap-4 relative z-10">
             <div className="text-center">
                <div className="text-sm font-black text-white">{data.leads.new}</div>
                <div className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-1">New</div>
             </div>
             <div className="text-center">
                <div className="text-sm font-black text-brand-neon">{data.leads.contacted}</div>
                <div className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-1">Active</div>
             </div>
             <div className="text-center">
                <div className="text-sm font-black text-emerald-400">{data.leads.closed}</div>
                <div className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-1">Closed</div>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Tips / Guidance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative rounded-[2.5rem] overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-brand-neon to-brand-accent opacity-90 transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full filter blur-[60px]" />
           
           <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                  <Sparkles className="w-3 h-3" />
                  Growth Accelerator
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tighter">
                  Scale your business <br /> within the ecosystem.
                </h2>
                <p className="text-white/80 font-medium leading-relaxed max-w-sm">
                  Premium partners receive 3x more leads by featuring their listings at the top of search results.
                </p>
                <button 
                  onClick={() => navigate('/cp/properties')}
                  className="bg-white text-brand-deep px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  Explore Premium <ChevronRight size={14} />
                </button>
              </div>
              <div className="hidden md:block">
                 <div className="w-40 h-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                    <BadgeCheck size={80} className="text-white opacity-80" />
                 </div>
              </div>
           </div>
        </div>
        
        <div className="glass-card border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full filter blur-[40px]" />
           <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 flex items-center justify-center shrink-0">
                <AlertCircle size={24}/>
              </div>
              <h4 className="font-black text-white text-lg tracking-tight">System Notice</h4>
           </div>
           <p className="text-brand-secondary text-sm leading-relaxed opacity-70 relative z-10 font-medium">
             Listing verification now takes less than 12 hours. Ensure high-quality 4K imagery to maintain 
             your partner trust score and avoid asset rejection.
           </p>
           <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
              <a href="https://github.com/google-gemini/gemini-cli" target="_blank" rel="noreferrer" className="text-[10px] font-black text-brand-neon uppercase tracking-widest flex items-center gap-2 hover:text-brand-accent transition-colors">
                View Verification Guidelines <ArrowRight size={12} />
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);

export default CPDashboard;
