import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, ShieldAlert, LogOut, MessageSquare, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ZikoLogo from '../../assets/ZikoLogoWhite.png';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

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
             <span className="text-xs font-black text-brand-neon uppercase tracking-[0.2em] bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20 shadow-glow-sm">Admin</span>
          </div>
          
          <nav className="p-6 space-y-3 flex flex-col">
            <Link 
              to="/admin" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              to="/admin/properties" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/properties') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home size={18} /> Properties
            </Link>
            <Link 
              to="/admin/clients" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/clients') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users size={18} /> Clients
            </Link>
            <Link 
              to="/admin/users" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/users') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldAlert size={18} /> Management
            </Link>
            <Link 
              to="/admin/subscriptions" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/subscriptions') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <CreditCard size={18} /> Subscriptions
            </Link>
            <Link 
              to="/admin/leads" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/leads') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare size={18} /> Lead Flow
            </Link>
            <Link 
              to="/admin/blogs" 
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                isActive('/admin/blogs') 
                  ? 'bg-brand-neon text-white shadow-glow' 
                  : 'text-brand-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText size={18} /> Blog CMS
            </Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/5 relative z-10">
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

export default AdminLayout;

