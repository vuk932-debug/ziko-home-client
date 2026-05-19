import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BlogHeader from '../components/layout/BlogHeader';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';
import { useAuth } from '../context/AuthContext';

/**
 * BlogLayout — wraps all blog-related pages with a shared BlogHeader and Footer.
 * Follows the requested structure: Header -> Main Content -> Footer.
 * Includes redirection logic for restricted roles (Admin, CP, WRITER).
 */
const BlogLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const restrictedRoles = ['Admin', 'CP', 'WRITER'];
      if (restrictedRoles.includes(user.role)) {
        console.log(`Restricted role ${user.role} detected on blog route ${location.pathname}. Redirecting to dashboard.`);
        
        if (user.role === 'Admin') navigate('/admin', { replace: true });
        else if (user.role === 'CP') navigate('/cp', { replace: true });
        else if (user.role === 'WRITER') navigate('/writer/dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white">
      {/* 1. Header */}
      <BlogHeader />

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <Outlet />
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Shared Auth Components */}
      <LoginModal />
    </div>
  );
};

export default BlogLayout;
