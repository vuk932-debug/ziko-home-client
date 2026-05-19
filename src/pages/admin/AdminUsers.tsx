import { useState, useEffect } from 'react';
import { Trash2, User as UserIcon, Loader2, Search, Plus, X, Copy, CheckCircle2, ShieldCheck, Zap, ChevronRight, ClipboardCheck, Calendar, AlertCircle, Info, Building2, Globe, MapPin, Phone, Mail, Award, BookOpen, KeyRound } from 'lucide-react';
import apiClient from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'CP' | 'Customer' | 'WRITER';
  isApproved: boolean;
  createdAt: string;
  profileCompleted?: boolean;
  profileImage?: string;
  companyName?: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  reraNumber?: string;
  website?: string;
  socialLinks?: string;
  specialization?: string;
}

const AdminUsers = () => {
  const { showNotification, confirm } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Customer' | 'CP' | 'WRITER' | 'Admin'>('All');

  // Modal States
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Reset Password State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [resetResult, setResetResult] = useState<{tempPassword?: string, resetUrl?: string} | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  
  // Onboarding Form State
  const [onboardRole, setOnboardRole] = useState<'CP' | 'WRITER'>('CP');
  const [cpName, setCpName] = useState('');
  const [cpEmail, setCpEmail] = useState('');
  const [cpPhone, setCpPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{agentId: string, tempPassword: string} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = onboardRole === 'CP' ? '/admin/users/cp' : '/admin/users/writer';
      const { data } = await apiClient.post(endpoint, {
        name: cpName,
        email: cpEmail,
        phone: cpPhone
      });
      setGeneratedCreds({
        agentId: data.data.agentId,
        tempPassword: data.data.tempPassword
      });
      fetchUsers();
      showNotification('success', `Partner onboarded as ${onboardRole}`);
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || `Failed to onboard ${onboardRole}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotification('info', 'Credentials copied to secure clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetOnboardModal = () => {
    setIsOnboardModalOpen(false);
    setGeneratedCreds(null);
    setCpName('');
    setCpEmail('');
    setCpPhone('');
    setOnboardRole('CP');
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      showNotification('success', `Identity role upgraded to ${newRole}`);
    } catch (err) {
      showNotification('error', 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Purge Identity',
      message: 'This will permanently remove the identity from the Ziko network. Proceed with purge?',
      type: 'danger',
      confirmText: 'Purge Identity'
    });
    if (!confirmed) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      showNotification('success', 'Identity purged from central ledger');
    } catch (err) {
      showNotification('error', 'Failed to delete user');
    }
  };

  const handleResetPassword = async (type: 'temp' | 'token') => {
    if (!userToReset) return;
    setIsResetting(true);
    try {
      const endpoint = type === 'temp' 
        ? `/admin/users/${userToReset.id}/reset-password-temp`
        : `/admin/users/${userToReset.id}/reset-password-token`;
      
      const { data } = await apiClient.post(endpoint);
      setResetResult(data.data);
      showNotification('success', `Security ${type === 'temp' ? 'code' : 'link'} generated successfully.`);
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to execute reset protocol.');
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setUserToReset(null);
    setResetResult(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.companyName && u.companyName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesTab = activeTab === 'All' || u.role === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const TabButton = ({ tab }: { tab: typeof activeTab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === tab ? 'bg-brand-neon text-white shadow-glow' : 'text-brand-muted hover:text-white hover:bg-white/5'
      }`}
    >
      {tab}s
    </button>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Identities...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <ShieldCheck className="w-3 h-3" />
            Security Protocol
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Identity <span className="text-brand-neon neon-text">Management</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Control platform-wide access, hierarchical roles, and partner onboarding.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon w-4 h-4 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter identities..." 
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsOnboardModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-brand-neon text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-glow hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span>Onboard Partner</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        <TabButton tab="All" />
        <TabButton tab="Customer" />
        <TabButton tab="CP" />
        <TabButton tab="WRITER" />
        <TabButton tab="Admin" />
      </div>

      {/* USERS TABLE */}
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Identity Details</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Communication</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Network Role</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Activation</th>
                <th className="px-8 py-6 text-brand-secondary font-black text-[10px] uppercase tracking-[0.2em] opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-neon to-brand-accent rounded-[1.25rem] flex items-center justify-center text-white font-black text-lg shadow-glow overflow-hidden shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-black text-lg tracking-tight group-hover:text-brand-neon transition-colors truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest mt-1 opacity-60 flex items-center gap-2 flex-wrap">
                          <span>{user.role} Identity</span>
                          {(user.role === 'CP' || user.role === 'WRITER') && (
                            <span className={`px-2 py-0.5 rounded-md ${user.profileCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} flex items-center gap-1`}>
                              {user.profileCompleted ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {user.profileCompleted ? 'Profile Complete' : 'Profile Pending'}
                            </span>
                          )}
                        </div>
                        {(user.companyName || user.specialization) && (
                          <div className="text-xs text-brand-muted mt-1 truncate max-w-[200px]">
                            {user.companyName || user.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-white font-bold text-sm">{user.email || 'No email provided'}</div>
                    <div className="text-[10px] text-brand-secondary font-medium uppercase tracking-widest mt-1 opacity-60">{user.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative inline-block">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border transition-all appearance-none cursor-pointer pr-10 focus:outline-none ${
                          user.role === 'Admin' ? 'bg-brand-neon/20 border-brand-neon/30 text-brand-neon' :
                          user.role === 'CP' ? 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent' :
                          user.role === 'WRITER' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' :
                          'bg-white/5 border-white/10 text-brand-secondary'
                        }`}
                      >
                        <option value="Customer" className="bg-brand-bg text-white">Customer</option>
                        <option value="CP" className="bg-brand-bg text-white">CP Partner</option>
                        <option value="WRITER" className="bg-brand-bg text-white">Writer</option>
                        <option value="Admin" className="bg-brand-bg text-white">System Admin</option>
                      </select>
                      <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-white font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-2">
                      <Calendar size={12}/> {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => {
                          setUserToReset(user);
                          setIsResetModalOpen(true);
                        }}
                        className="p-3 text-brand-secondary hover:text-brand-accent hover:bg-brand-accent/10 hover:border-brand-accent/20 border border-transparent rounded-xl transition-all"
                        title="Reset Password"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-3 text-brand-secondary hover:text-brand-neon hover:bg-brand-neon/10 hover:border-brand-neon/20 border border-transparent rounded-xl transition-all"
                        title="View Full Profile"
                      >
                        <Info size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-3 text-brand-secondary hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 border border-transparent rounded-xl transition-all"
                        title="Delete Identity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <UserIcon className="w-10 h-10 text-brand-secondary opacity-20" />
             </div>
             <p className="text-brand-secondary font-black text-xs uppercase tracking-widest opacity-60">No identities found matching current filters.</p>
          </div>
        )}
      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/90 backdrop-blur-xl">
          <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-glow-lg animate-slide-up max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-gradient-to-br from-brand-neon to-brand-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-glow overflow-hidden">
                    {selectedUser.profileImage ? <img src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" /> : selectedUser.name.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                    <p className="text-brand-neon text-[10px] font-black uppercase tracking-widest">{selectedUser.role} Profile</p>
                 </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-brand-secondary"><X size={24}/></button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
              {/* Core Identity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Mail size={12}/> Email Address</p>
                    <p className="text-white font-bold">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Phone size={12}/> Primary Contact</p>
                    <p className="text-white font-bold font-mono">{selectedUser.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Calendar size={12}/> Registration Date</p>
                    <p className="text-white font-bold">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedUser.role === 'CP' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Building2 size={12}/> Company Entity</p>
                        <p className="text-white font-bold">{selectedUser.companyName || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Award size={12}/> RERA Authorization</p>
                        <p className="text-white font-bold">{selectedUser.reraNumber || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                  {selectedUser.role === 'WRITER' && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><BookOpen size={12}/> Content Domain</p>
                      <p className="text-white font-bold">{selectedUser.specialization || 'N/A'}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Globe size={12}/> Location Node</p>
                    <p className="text-white font-bold">
                      {selectedUser.city ? `${selectedUser.city}, ${selectedUser.state}` : 'Global Network'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extended Details */}
              {selectedUser.bio && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60">Identity Biography</p>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-brand-secondary text-sm leading-relaxed whitespace-pre-wrap italic">
                    "{selectedUser.bio}"
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedUser.officeAddress && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><MapPin size={12}/> Physical Headquarters</p>
                    <p className="text-white font-medium text-sm leading-relaxed">{selectedUser.officeAddress}</p>
                  </div>
                )}
                {selectedUser.website && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 flex items-center gap-2"><Globe size={12}/> Digital presence</p>
                    <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-brand-neon hover:text-brand-accent transition-colors font-bold text-sm underline underline-offset-4 decoration-brand-neon/30">
                      {selectedUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-white/5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.profileCompleted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                  {selectedUser.profileCompleted ? 'Authorized Identity' : 'Skeletal Node'}
                </span>
                {selectedUser.isApproved && (
                   <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-neon/10 text-brand-neon border border-brand-neon/20 flex items-center gap-1.5">
                     <ShieldCheck size={10}/> Verified Partner
                   </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/80 backdrop-blur-xl">
          <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-glow-lg animate-slide-up">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-neon/10 rounded-xl flex items-center justify-center text-brand-neon">
                    <Zap size={20}/>
                 </div>
                 <h2 className="text-xl font-black text-white tracking-tight">Generate Credentials</h2>
              </div>
              <button onClick={resetOnboardModal} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-secondary"><X size={20}/></button>
            </div>

            <div className="p-8">
              {!generatedCreds ? (
                <form onSubmit={handleOnboard} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">Onboarding Role</label>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                      {[
                        { id: 'CP', label: 'Partner' },
                        { id: 'WRITER', label: 'Writer' }
                      ].map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setOnboardRole(role.id as any)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            onboardRole === role.id ? 'bg-brand-neon text-white shadow-glow' : 'text-brand-muted hover:text-white'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                      placeholder="e.g. John Wick"
                      value={cpName}
                      onChange={e => setCpName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">Secure Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                      placeholder="wick@nexus.com"
                      value={cpEmail}
                      onChange={e => setCpEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] ml-1">Phone Identifier</label>
                    <input 
                      required 
                      type="tel" 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono"
                      placeholder="10-digit primary contact"
                      value={cpPhone}
                      onChange={e => setCpPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brand-neon hover:bg-brand-accent disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all mt-4 flex items-center justify-center gap-3 shadow-glow"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Authorize & Generate'}
                  </button>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-start gap-4">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={24}/>
                    <div>
                       <p className="text-white font-black text-sm tracking-tight">Identity Authorized</p>
                       <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-widest mt-1 leading-relaxed">
                         The {onboardRole === 'CP' ? 'Channel Partner' : 'Content Writer'} has been successfully registered within the Ziko Global network.
                       </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 relative group">
                      <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Agent ID Protocol</span>
                      <div className="text-xl font-mono text-white mt-1.5 tracking-tighter">{generatedCreds.agentId}</div>
                      <button 
                        onClick={() => copyToClipboard(generatedCreds.agentId)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-brand-neon hover:text-white rounded-xl text-brand-secondary transition-all"
                      >
                        {copied ? <ClipboardCheck size={16}/> : <Copy size={16}/>}
                      </button>
                    </div>

                    <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 relative group">
                      <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Temporary Access Code</span>
                      <div className="text-xl font-mono text-white mt-1.5 tracking-tighter">{generatedCreds.tempPassword}</div>
                      <button 
                        onClick={() => copyToClipboard(generatedCreds.tempPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-brand-neon hover:text-white rounded-xl text-brand-secondary transition-all"
                      >
                        {copied ? <ClipboardCheck size={16}/> : <Copy size={16}/>}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-brand-secondary font-bold uppercase tracking-widest opacity-40 italic">Share these encrypted credentials immediately. They will not be stored in plain text.</p>

                  <button 
                    onClick={resetOnboardModal}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
                  >
                    Complete Protocol
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/80 backdrop-blur-xl">
          <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-glow-lg animate-slide-up">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                    <KeyRound size={20}/>
                 </div>
                 <h2 className="text-xl font-black text-white tracking-tight">Security Reset</h2>
              </div>
              <button onClick={closeResetModal} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-secondary"><X size={20}/></button>
            </div>

            <div className="p-8">
              {!resetResult ? (
                <div className="space-y-6">
                  <p className="text-brand-secondary text-sm leading-relaxed">
                    Initiate a security reset for <span className="text-white font-bold">{userToReset?.name}</span>. Choose the preferred override method:
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleResetPassword('temp')}
                      disabled={isResetting}
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-neon/50 hover:bg-brand-neon/5 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-black text-xs uppercase tracking-widest">Generate Temp Code</p>
                          <p className="text-[10px] text-brand-secondary mt-1 group-hover:text-brand-neon transition-colors">Immediate access with a one-time code.</p>
                        </div>
                        <Zap size={20} className="text-brand-muted group-hover:text-brand-neon transition-all" />
                      </div>
                    </button>

                    <button 
                      onClick={() => handleResetPassword('token')}
                      disabled={isResetting}
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-black text-xs uppercase tracking-widest">Generate Reset Link</p>
                          <p className="text-[10px] text-brand-secondary mt-1 group-hover:text-brand-accent transition-colors">Send a secure link for user-defined reset.</p>
                        </div>
                        <Globe size={20} className="text-brand-muted group-hover:text-brand-accent transition-all" />
                      </div>
                    </button>
                  </div>
                  
                  {isResetting && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="animate-spin text-brand-neon" size={24} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-brand-accent/10 border border-brand-accent/20 p-6 rounded-3xl flex items-start gap-4">
                    <ShieldCheck className="text-brand-accent shrink-0" size={24}/>
                    <div>
                       <p className="text-white font-black text-sm tracking-tight">Override Authorized</p>
                       <p className="text-brand-accent/80 text-[10px] font-bold uppercase tracking-widest mt-1 leading-relaxed">
                         The security override has been successfully generated. Provide these credentials to the user via a secure channel.
                       </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {resetResult.tempPassword && (
                      <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 relative group">
                        <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Temporary Access Code</span>
                        <div className="text-xl font-mono text-white mt-1.5 tracking-tighter">{resetResult.tempPassword}</div>
                        <button 
                          onClick={() => copyToClipboard(resetResult.tempPassword!)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-brand-neon hover:text-white rounded-xl text-brand-secondary transition-all"
                        >
                          {copied ? <ClipboardCheck size={16}/> : <Copy size={16}/>}
                        </button>
                      </div>
                    )}

                    {resetResult.resetUrl && (
                      <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 relative group">
                        <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Secure Reset Link</span>
                        <div className="text-xs font-mono text-brand-accent mt-1.5 break-all pr-12 leading-relaxed">{resetResult.resetUrl}</div>
                        <button 
                          onClick={() => copyToClipboard(resetResult.resetUrl!)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-brand-accent hover:text-white rounded-xl text-brand-secondary transition-all"
                        >
                          {copied ? <ClipboardCheck size={16}/> : <Copy size={16}/>}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-center text-brand-secondary font-bold uppercase tracking-widest opacity-40 italic">This code/link will expire in 24 hours. Do not share publicly.</p>

                  <button 
                    onClick={closeResetModal}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
                  >
                    Terminate Protocol
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
