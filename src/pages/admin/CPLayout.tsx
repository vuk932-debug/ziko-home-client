import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, LogOut, MessageSquare, Clock, ShieldCheck, AlertTriangle, AlertCircle, Sparkles, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';
import ZikoLogo from '../../assets/ZikoLogoWhite.png';

const CPLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const fetchSubscription = async () => {
    try {
      const { data } = await apiClient.get('/subscriptions/me');
      setSubscription(data.data);
    } catch {
      console.error('Failed to fetch subscription');
    }
  };

  useEffect(() => {
    if (user && user.role === 'CP') {
      fetchSubscription();
    }
  }, [user]);

  // If cp is not approved, show pending state
  if (user && !user.isApproved) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-neon/10 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 text-center border-white/5 shadow-glow-lg relative z-10">
          <div className="w-24 h-24 bg-brand-neon/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-neon/20 group hover:scale-110 transition-transform duration-500">
            <Clock className="w-12 h-12 text-brand-neon animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">Identity <span className="text-brand-neon">Pending</span></h1>
          <p className="text-brand-secondary font-medium mb-8 opacity-70 leading-relaxed">
            Hello {user.name}! Your partner credentials are being verified by our intelligence team. 
            Access to the marketplace will be granted shortly.
          </p>
          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-left space-y-3">
               <div className="flex items-center gap-3 text-xs font-bold text-brand-secondary uppercase tracking-widest">
                 <ShieldCheck className="w-4 h-4 text-brand-neon" />
                 <span>Verified Phone: {user.phone}</span>
               </div>
               <div className="flex items-center gap-3 text-xs font-bold text-brand-secondary uppercase tracking-widest">
                 <Sparkles className="w-4 h-4 text-brand-accent" />
                 <span>Role: CP</span>
               </div>
            </div>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-bg text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-brand-deep border-r border-white/5 flex flex-col justify-between shrink-0 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-accent/10 rounded-full filter blur-[60px]" />
        
        <div className="relative z-10">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <img src={ZikoLogo} alt="ZikoHome Logo" className="h-10 w-auto object-contain" />
             <span className="text-xs font-black text-brand-accent uppercase tracking-[0.2em] bg-brand-accent/10 px-3 py-1.5 rounded-lg border border-brand-accent/20 shadow-glow-sm">Partner</span>
          </div>
          
          <nav className="p-6 space-y-3 flex flex-col">
            <Link 
              to="/cp" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/cp') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              to="/cp/properties" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/cp/properties') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home size={18} /> Asset Catalog
            </Link>
            <Link 
              to="/cp/leads" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/cp/leads') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare size={18} /> Lead Stream
            </Link>
            <Link 
              to="/profile/setup" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest relative group ${
                isActive('/profile/setup') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck size={18} /> 
              <span>Profile Settings</span>
              {user && !user.profileCompleted && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-brand-accent rounded-full shadow-glow animate-pulse" />
                </div>
              )}
            </Link>
          </nav>
        </div>
        
        <div className="p-6 space-y-4 relative z-10">
           {user && !user.profileCompleted && (
             <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
                <div className="flex items-center gap-2 text-brand-accent">
                   <AlertCircle size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Profile Incomplete</span>
                </div>
                <p className="text-[9px] font-medium text-brand-secondary leading-relaxed opacity-70">Complete your profile to unlock full credentials and public visibility.</p>
                <Link to="/profile/setup" className="text-[9px] font-black uppercase tracking-widest text-brand-accent hover:underline underline-offset-4">Configure Now &rarr;</Link>
             </div>
           )}
           <button 
             onClick={() => { logout(); navigate('/'); }} 
             className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-red-500/20"
           >
             <LogOut size={16} /> LOG OUT
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {subscription && !subscription.active && (
          <div className="sticky top-0 z-50 bg-red-500/10 backdrop-blur-xl border-b border-red-500/20 px-8 py-4 flex items-center justify-between gap-6 text-red-400 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-black uppercase tracking-[0.2em] block">Access Restricted</span>
                <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest">
                  Subscription expired. Assets are currently invisible to the public network.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchSubscription}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                title="Refresh Status"
              >
                <RefreshCcw size={16} />
              </button>
              <button 
                onClick={() => setIsRenewalModalOpen(true)}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40 transition-all"
              >
                Restore Plan
              </button>
            </div>
          </div>
        )}

        {/* Renewal Instruction Modal */}
        {isRenewalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/80 backdrop-blur-xl">
             <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-glow-lg animate-slide-up">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                         <RefreshCcw size={20} />
                      </div>
                      <h2 className="text-xl font-black text-white tracking-tight">Protocol Renewal</h2>
                   </div>
                   <button onClick={() => setIsRenewalModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-secondary">
                      <RefreshCcw size={20} className="rotate-45" />
                   </button>
                </div>
                <div className="p-10 space-y-6 text-center">
                   <div className="w-20 h-20 bg-brand-neon/10 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-brand-neon/20">
                      <ShieldCheck className="w-10 h-10 text-brand-neon" />
                   </div>
                   <p className="text-brand-secondary font-medium opacity-80 leading-relaxed">
                      To restore your network bandwidth and reactivate your asset catalog, please contact your account administrator.
                   </p>
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest opacity-60">Authorized Admin Node</p>
                      <p className="text-white font-black text-lg">admin@zikohome.com</p>
                      <p className="text-brand-secondary text-xs">+91 99999 88888</p>
                   </div>
                </div>
                <div className="p-8 border-t border-white/5 bg-white/5">
                   <button 
                     onClick={() => setIsRenewalModalOpen(false)}
                     className="w-full py-4 bg-brand-neon text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-glow"
                   >
                     Acknowledge Protocol
                   </button>
                </div>
             </div>
          </div>
        )}
        
        {/* Background Decorative Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="p-8 lg:p-16 relative z-10">
          <Outlet context={{ subscription }} />
        </div>
      </div>
    </div>
  );
};

export default CPLayout;
