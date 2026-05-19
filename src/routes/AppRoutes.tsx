import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import BlogLayout from '../layouts/BlogLayout';
import Home from '../pages/Home';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MapSearchPage from '../pages/MapSearchPage';
import PropertiesPage from '../pages/PropertiesPage';
import PropertyDetails from '../pages/PropertyDetails';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import OTPViewer from '../pages/OTPViewer';
import ProfileSetup from '../pages/ProfileSetup';

// Admin Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProperties from '../pages/admin/AdminProperties';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminClients from '../pages/admin/AdminClients';
import AdminLeads from '../pages/admin/AdminLeads';
import CPLeads from '../pages/admin/CPLeads';
import AdminSubscriptions from '../pages/admin/AdminSubscriptions';
import CPDashboard from '../pages/admin/CPDashboard';
import CPLayout from '../pages/admin/CPLayout';
import AdminBlogs from '../pages/admin/AdminBlogs';
import WriterLayout from '../pages/admin/WriterLayout';
import WriterDashboard from '../pages/admin/WriterDashboard';
import BlogEditor from '../pages/admin/BlogEditor';

import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Route>

      {/* Blog Routes */}
      <Route element={<BlogLayout />}>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/writer/login" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/map" element={<MapSearchPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dev-tools/otp-viewer" element={<OTPViewer />} />

      {/* Profile Setup - Accessible by CP, WRITER, and optionally Admin */}
      <Route element={<ProtectedRoute allowedRoles={['CP', 'WRITER', 'Admin']} />}>
        <Route path="/profile/setup" element={<ProfileSetup />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/blogs" element={<AdminBlogs />} />
        </Route>
      </Route>

      {/* Writer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin', 'WRITER']} />}>
        <Route element={<WriterLayout />}>
          <Route path="/writer" element={<Navigate to="/writer/dashboard" replace />} />
          <Route path="/writer/dashboard" element={<WriterDashboard />} />
          <Route path="/writer/editor/:id" element={<BlogEditor />} />
        </Route>
      </Route>

      {/* Channel Partner Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CP']} />}>
        <Route element={<CPLayout />}>
          <Route path="/cp" element={<CPDashboard />} />
          <Route path="/cp/properties" element={<AdminProperties />} />
          <Route path="/cp/leads" element={<CPLeads />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg text-center px-4">
            <div>
              <p className="text-8xl font-black text-slate-200 dark:text-slate-800">404</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">Page not found</h1>
              <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
