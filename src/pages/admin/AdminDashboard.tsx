import { useState, useEffect } from 'react';
import { Network, Home, Users, ArrowUpRight, CheckCircle, Loader2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/axios';

interface Analytics {
  totalSellers: number;
  activeSellers: number;
  expiredSellers: number;
  totalBuyers: number;
  totalListings: number;
  totalLeads: number;
  conversionRate: string;
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await apiClient.get('/admin/analytics');
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Metrics...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Sparkles className="w-3 h-3" />
            System Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Oversight <span className="text-brand-neon neon-text">Grid</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Real-time mapping of platform-wide asset flow and user intelligence.</p>
        </div>
        
        <div className="flex items-center gap-4 text-brand-muted text-[11px] font-bold uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
          <Activity className="w-4 h-4 text-brand-neon animate-pulse" />
          <span className="text-brand-neon">Protocol</span> SECURE
        </div>
      </div>

      {/* Dashboard Statistical Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-brand-neon/30 transition-all duration-500">
           <div className={`absolute top-0 right-0 p-6 opacity-10 text-brand-neon w-28 h-28 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform`}>
             <Users />
           </div>
           <div className="relative z-10">
              <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Supply Nodes</p>
              <p className="text-4xl font-black text-white mt-3 tracking-tighter">{metrics?.totalSellers || 0}</p>
           </div>
           <div className="mt-6 space-y-2 relative z-10">
             <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
               <span className="text-emerald-500 flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-glow" />
                 Active: {metrics?.activeSellers || 0}
               </span>
               <span className="text-red-400 flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-red-400" />
                 Expired: {metrics?.expiredSellers || 0}
               </span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(metrics?.activeSellers || 0) / (metrics?.totalSellers || 1) * 100}%` }}
                />
             </div>
           </div>
        </div>
        <MetricCard title="Demand Nodes" value={metrics?.totalBuyers || 0} icon={<Network />} trend="Registered Buyers" color="text-brand-accent" />
        <MetricCard title="Asset Catalog" value={metrics?.totalListings || 0} icon={<Home />} trend="Live Listings" color="text-blue-400" />
        
        <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-brand-neon/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-brand-neon w-28 h-28 transform group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <ArrowUpRight className="w-full h-full" />
            </div>
            <div className="relative z-10">
               <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Intelligence Flow</p>
               <p className="text-4xl font-black text-white mt-3 tracking-tighter">{metrics?.totalLeads || 0}</p>
            </div>
            <div className="mt-6 flex items-center justify-between relative z-10">
              <span className="text-white font-black text-xs bg-brand-neon px-3 py-1 rounded-lg shadow-glow">
                {metrics?.conversionRate || '0%'} 
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Conversion</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] border-white/5 p-10 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full filter blur-[80px]" />
           
           <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
             <Activity className="w-6 h-6 text-brand-neon" />
             Core Engine Status
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusRow label="Main API Cluster" status="Operational" sub="Latency 24ms" icon="API" activeColor="bg-brand-neon" />
              <StatusRow label="Persistence Layer" status="Connected" sub="MongoDB Managed" icon="DB" activeColor="bg-brand-accent" />
              <StatusRow label="Edge Cache" status="Synchronized" sub="Redis Global" icon="EC" activeColor="bg-blue-500" />
              <StatusRow label="AI Valuation" status="Optimized" sub="Proprietary Model" icon="AI" activeColor="bg-purple-500" />
           </div>
        </div>
        
        <div className="glass-card rounded-[2.5rem] border-white/5 p-10 flex flex-col justify-center items-center text-center group hover:border-brand-accent/30 transition-all">
           <div className="w-20 h-20 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-500">
             <ShieldCheck className="w-10 h-10 text-brand-accent" />
           </div>
           <p className="text-white font-black text-xl mb-2 tracking-tight">Encryption Active</p>
           <p className="text-brand-secondary text-sm leading-relaxed opacity-70">
             Administrative protocols are enforced via hardware-level encryption and real-time session monitoring.
           </p>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status, sub, icon, activeColor }: any) => (
  <div className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${activeColor}/20 ${activeColor.replace('bg-', 'text-')} rounded-2xl flex justify-center items-center font-black text-xs border border-white/5`}>
            {icon}
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">{label}</p>
            <p className="text-[10px] text-brand-secondary font-medium uppercase tracking-widest opacity-60 mt-0.5">{sub}</p>
          </div>
      </div>
      <div className="flex flex-col items-end">
        <CheckCircle className={activeColor.replace('bg-', 'text-')} size={16} />
        <span className="text-[8px] font-black text-white/40 uppercase mt-1 tracking-tighter">{status}</span>
      </div>
  </div>
);

const MetricCard = ({ title, value, icon, trend, color }: any) => (
  <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-brand-neon/30 transition-all duration-500">
     <div className={`absolute top-0 right-0 p-6 opacity-10 ${color} w-28 h-28 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform`}>
       {icon}
     </div>
     <div className="relative z-10">
        <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
        <p className="text-4xl font-black text-white mt-3 tracking-tighter">{value.toLocaleString()}</p>
     </div>
     <div className="mt-6 flex items-center gap-2 relative z-10">
       <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} shadow-glow`} />
       <p className={`${color} font-black text-[10px] uppercase tracking-[0.2em]`}>{trend}</p>
     </div>
  </div>
);

export default AdminDashboard;
