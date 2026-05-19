import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, Loader2, KeyRound } from 'lucide-react';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    officeAddress: '',
    city: '',
    state: '',
    country: 'India',
    bio: '',
    reraNumber: '',
    website: '',
    specialization: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/profile');
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          companyName: data.companyName || '',
          officeAddress: data.officeAddress || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          bio: data.bio || '',
          reraNumber: data.reraNumber || '',
          website: data.website || '',
          specialization: data.specialization || '',
        });
        if (data.profileImage) {
          setImagePreview(data.profileImage);
        }
      } catch (err: any) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const { data } = await apiClient.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser({ profileCompleted: true, name: data.name });
      setSuccess('Profile updated successfully!');
      
      // Redirect after short delay
      setTimeout(() => {
        if (user?.role === 'Admin') navigate('/admin');
        else if (user?.role === 'CP') navigate('/cp');
        else if (user?.role === 'WRITER') navigate('/writer/dashboard');
        else navigate('/');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/profile/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  const isCP = user.role === 'CP';
  const isWriter = user.role === 'WRITER';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-6 lg:p-12 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Profile Setup</h1>
            <p className="text-slate-500 mt-2">Complete your profile to access your dashboard.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm font-bold">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Details Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a professional photo or logo.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              {isCP && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                      <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">RERA Number</label>
                      <input type="text" name="reraNumber" value={form.reraNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Office Address</label>
                    <input type="text" name="officeAddress" value={form.officeAddress} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                      <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">State</label>
                      <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Country</label>
                      <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                  </div>
                </>
              )}

              {isWriter && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Specialization / Topics</label>
                  <input type="text" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Market Trends, Architecture" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bio / About</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none resize-none"></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>

            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={8} 
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength={8} 
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none" 
                />
              </div>

              <button type="submit" disabled={isChangingPassword} className="w-full px-6 py-3 mt-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;