import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useDebounce } from '../../utils/useDebounce';
import { useAuth } from '../../context/AuthContext';
import ZikoLogo from '../../assets/ZikoLogoWhite.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  // const [isDark, setIsDark] = useState(true); // Default to dark as per brand identity
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; slug: string; title: string; city: string; price: number; images: string[] }[]>([]);

  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dark Mode Logic (Preserved for future use)
  /*
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDark(false);
    else setIsDark(true); // Default to dark
  }, []);
  */

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/suggest?q=${debouncedSearch}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Network Error querying suggestion arrays', err);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);


  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled
        ? 'glass-morphism py-2'
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <img 
              src={ZikoLogo} 
              alt="ZikoHome" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </div>

          {/* Search Bar [Desktop] */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Find your future home..."
                className="input-field pl-5 pr-12 py-2.5 !bg-brand-deep/30 backdrop-blur-sm border-white/10 group-hover:border-brand-neon/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-neon hover:bg-brand-accent text-white p-1.5 rounded-lg transition-all shadow-glow">
                <Search className="w-4 h-4" />
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute top-14 left-0 w-full glass-morphism rounded-xl overflow-hidden animate-slide-up border-white/10">
                {suggestions.map((item) => (
                  <Link 
                    to={`/properties/${item.slug}`} 
                    key={item.id}
                    onClick={() => {setSearchQuery(''); setSuggestions([]);}}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <img src={item.images[0]?.replace('upload/', 'upload/w_100,h_100,c_fill/')} alt="prop" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-white text-sm line-clamp-1">{item.title}</p>
                      <p className="text-xs text-brand-secondary">{item.city} • ${item.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-brand-secondary hover:text-white hover:neon-text transition-all">Home</Link>
            <Link to="/properties" className="text-sm font-medium text-brand-secondary hover:text-white hover:neon-text transition-all">Properties</Link>
            {/* <Link to="/map" className="text-sm font-medium text-brand-secondary hover:text-white hover:neon-text transition-all">Map</Link> */}
            <Link to="/blog" className="text-sm font-medium text-brand-secondary hover:text-white hover:neon-text transition-all">Blog</Link>

            {user?.role === 'Admin' && (
              <Link to="/admin" className="text-sm font-bold text-brand-neon hover:text-brand-accent transition-all">Dashboard</Link>
            )}
            {user?.role === 'CP' && (
              <Link to="/cp" className="text-sm font-bold text-brand-neon hover:text-brand-accent transition-all">Dashboard</Link>
            )}

            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

            {/* Theme Toggle (Preserved for future use) */}
            {/* 
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-white/5 text-brand-secondary hover:text-brand-neon transition-all"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            */}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-brand-neon/10 border border-brand-neon/20">
                  <div className="w-7 h-7 rounded-full bg-brand-neon flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[80px] truncate">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-2 !px-5 text-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/5 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-morphism border-t border-white/10 p-4 animate-fade-in">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-brand-secondary hover:text-white">Home</Link>
            <Link to="/properties" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-brand-secondary hover:text-white">Properties</Link>
            {/* <Link to="/map" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-brand-secondary hover:text-white">Map</Link> */}
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-brand-secondary hover:text-white">Blog</Link>
            
            <div className="h-[1px] bg-white/5 w-full"></div>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-brand-neon flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{user?.name}</span>
                </div>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
