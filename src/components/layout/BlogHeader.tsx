import { Link } from 'react-router-dom';
import ZikoLogo from '../../assets/ZikoLogoWhite.png';

/**
 * BlogHeader — A minimal header specifically for the Blog section.
 * Features the ZikoLogo on the left and primary navigation on the right.
 */
const BlogHeader = () => {
  return (
    <header className="w-full border-b border-white/5 bg-brand-deep/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group transition-transform hover:scale-105">
            <img 
              src={ZikoLogo} 
              alt="ZikoHome Logo" 
              className="h-10 w-auto object-contain" 
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-brand-secondary hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className="text-sm font-medium text-brand-secondary hover:text-white transition-colors"
            >
              Properties
            </Link>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <Link 
              to="/blog" 
              className="text-sm font-bold text-brand-neon tracking-wider uppercase drop-shadow-glow"
            >
              Blog
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
};

export default BlogHeader;
