import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';
import { useAuth } from '../context/AuthContext';

/**
 * MainLayout — wraps all public-facing pages with a shared Navbar and Footer.
 * Uses React Router's <Outlet /> so child routes render within the layout.
 * Includes redirection logic for restricted roles (Admin, CP, WRITER).
 */
const MainLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const restrictedRoles = ['Admin', 'CP', 'WRITER'];
      if (restrictedRoles.includes(user.role)) {
        console.log(`Restricted role ${user.role} detected on public route ${location.pathname}. Redirecting to dashboard.`);
        
        if (user.role === 'Admin') navigate('/admin', { replace: true });
        else if (user.role === 'CP') navigate('/cp', { replace: true });
        else if (user.role === 'WRITER') navigate('/writer/dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
    </div>
  );
};

export default MainLayout;
