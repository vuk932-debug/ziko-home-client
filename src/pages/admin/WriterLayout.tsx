import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ZikoLogo from '../../assets/ZikoLogoWhite.png';

const WriterLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-brand-bg text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-brand-deep border-r border-white/5 flex flex-col justify-between shrink-0 relative overflow-hidden">
        {/* Decorative Glow in Sidebar */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-neon/10 rounded-full filter blur-[60px]" />
        
        <div className="relative z-10">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <img src={ZikoLogo} alt="ZikoHome Logo" className="h-10 w-auto object-contain" />
             <span className="text-xs font-black text-brand-neon uppercase tracking-[0.2em] bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20 shadow-glow-sm">Writer</span>
          </div>
          
          <nav className="p-6 space-y-3 flex flex-col">
            <Link 
              to="/writer/dashboard" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/writer/dashboard') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              to="/writer/editor/new" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                location.pathname.startsWith('/writer/editor')
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText size={18} /> New Protocol
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
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="p-8 lg:p-16 relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WriterLayout;
