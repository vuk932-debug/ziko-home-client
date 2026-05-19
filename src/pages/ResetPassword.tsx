import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import apiClient from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Cryptographic mismatch: Passwords do not align.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Security requirement: Minimum 6 character complexity.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await apiClient.post(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage('Credential encryption updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Protocol timeout. Reset link invalidated.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/10 rounded-full filter blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card rounded-[2.5rem] border-white/10 p-10 relative z-10 shadow-glow-lg animate-fade-in">
        
        {status === 'success' ? (
          <div className="text-center py-8 animate-slide-up space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Protocol <span className="text-emerald-400">Restored</span></h2>
              <p className="text-brand-secondary font-medium opacity-60 text-sm">Your new credentials have been synchronized across the Ziko network.</p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary animate-pulse">
                Redirecting to Access Portal...
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center border border-brand-accent/20 shadow-glow group hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-10 h-10 text-brand-accent group-hover:animate-pulse" />
              </div>
            </div>

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-accent mb-4">
                <Zap className="w-3 h-3" />
                Security Protocol
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
                New <span className="text-brand-accent neon-text">Password</span>
              </h2>
              <p className="text-brand-secondary font-medium opacity-60 leading-relaxed text-sm">
                Set a new password for your account to regain access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {message}
                </div>
              )}
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-brand-accent hover:bg-brand-neon disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-glow hover:scale-[1.02] active:scale-95"
              >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Update Password <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

