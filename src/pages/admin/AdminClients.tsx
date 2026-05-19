import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Loader2, 
  ShieldCheck, 
  ShieldOff, 
  Activity, 
  RefreshCw,
  Ban,
  UserCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import apiClient from '../../api/axios';
import { format } from 'date-fns';
import ActivityModal from '../../components/property/ActivityModal';
import { useNotification } from '../../context/NotificationContext';

interface CPClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  agentId: string;
  isActive: boolean;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'NONE';
  subscription?: {
    planType: string;
    endDate: string;
  };
  createdAt: string;
}

const AdminClients = () => {
  const { showNotification } = useNotification();
  const [clients, setClients] = useState<CPClient[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'DISABLED'>('ALL');

  // Activity Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchClients(pagination.page);
  }, [pagination.page]);

  const fetchClients = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/admin/clients?page=${page}&limit=10`);
      setClients(data.clients);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/admin/clients/${id}/status`, { isActive: !currentStatus });
      setClients(clients.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (err) {
      showNotification('error', 'Failed to update status');
    }
  };

  const openActivity = (client: CPClient) => {
    setSelectedClient({ id: client.id, name: client.name });
    setIsActivityModalOpen(true);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.agentId?.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'ACTIVE') return matchesSearch && c.subscriptionStatus === 'ACTIVE' && c.isActive;
    if (filter === 'EXPIRED') return matchesSearch && c.subscriptionStatus === 'EXPIRED';
    if (filter === 'DISABLED') return matchesSearch && !c.isActive;
    return matchesSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Lifecycle...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Activity className="w-3 h-3" />
            Operational Flow
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Client <span className="text-brand-neon neon-text">Operations</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Lifecycle management for global channel partners and ecosystem actors.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon w-4 h-4 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID, Name..." 
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative inline-block">
            <select 
              value={filter}
              onChange={(e: any) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/5 text-brand-secondary text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-neon appearance-none cursor-pointer pr-12 transition-all hover:bg-white/10"
            >
              <option value="ALL" className="bg-brand-deep">All Clients</option>
              <option value="ACTIVE" className="bg-brand-deep">Active Network</option>
              <option value="EXPIRED" className="bg-brand-deep">Expired Assets</option>
              <option value="DISABLED" className="bg-brand-deep">Terminated</option>
            </select>
            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-secondary pointer-events-none" />
          </div>

          <button 
            onClick={() => fetchClients()}
            className="p-3.5 bg-white/5 hover:bg-white/10 text-brand-secondary hover:text-white rounded-2xl transition-all border border-white/5"
            title="Refresh Ledger"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Identity Profile</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Plan Parameters</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Auth Status</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Subscription Ledger</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-neon to-brand-accent rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-glow">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-black text-lg tracking-tight group-hover:text-brand-neon transition-colors">{client.name}</div>
                        <div className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mt-1">{client.agentId || 'NO-ID-ASSIGNED'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-white font-bold text-sm">{client.email}</div>
                    <div className="text-[10px] text-brand-secondary font-medium uppercase tracking-widest mt-1 opacity-60">{client.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      client.isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {client.isActive ? <ShieldCheck size={12}/> : <ShieldOff size={12}/>}
                      {client.isActive ? 'Active Node' : 'Disconnected'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {client.subscriptionStatus === 'NONE' ? (
                      <span className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-40 italic">Zero Bandwidth Assigned</span>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                             client.subscriptionStatus === 'ACTIVE' ? 'bg-brand-neon/20 border-brand-neon/30 text-brand-neon' : 'bg-white/5 border-white/10 text-brand-secondary opacity-40'
                           }`}>
                             {client.subscription?.planType}
                           </span>
                           <span className={`text-[9px] font-black uppercase tracking-tighter ${
                             client.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'
                           }`}>
                             {client.subscriptionStatus}
                           </span>
                        </div>
                        <div className="text-[9px] text-brand-secondary font-bold uppercase tracking-widest opacity-40">
                          Expires: {client.subscription?.endDate ? format(new Date(client.subscription.endDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => toggleStatus(client.id, client.isActive)}
                        className={`p-3 rounded-xl transition-all border border-transparent ${
                          client.isActive ? 'text-brand-secondary hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20' : 'text-brand-secondary hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                        }`}
                        title={client.isActive ? 'Terminate Access' : 'Authorize Identity'}
                      >
                        {client.isActive ? <Ban size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button 
                        onClick={() => openActivity(client)}
                        className="p-3 text-brand-secondary hover:text-brand-neon hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all"
                        title="Intelligence Log"
                      >
                        <Zap size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <Users className="w-10 h-10 text-brand-secondary opacity-20" />
             </div>
             <p className="text-brand-secondary font-black text-xs uppercase tracking-widest opacity-60">No active clients found in central ledger.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <p className="text-brand-secondary text-[10px] font-black uppercase tracking-widest opacity-60">
          Showing <span className="text-white">{filteredClients.length}</span> of <span className="text-white">{pagination.total}</span> Network Identities
        </p>
        <div className="flex gap-3">
          <button 
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="px-6 py-2.5 bg-white/5 text-brand-secondary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
          >
            Prev Ledger
          </button>
          <button 
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="px-6 py-2.5 bg-white/5 text-brand-secondary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
          >
            Next Ledger
          </button>
        </div>
      </div>

      {selectedClient && (
        <ActivityModal 
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </div>
  );
};

export default AdminClients;

