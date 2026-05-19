import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, KeyRound, Zap, ChevronLeft } from 'lucide-react';
import apiClient from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(data.message || 'Transmission successful. Check your digital inbox.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Protocol failure. Link generation aborted.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-neon/10 rounded-full filter blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card rounded-[2.5rem] border-white/10 p-10 relative z-10 shadow-glow-lg animate-fade-in">
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 bg-brand-neon/10 rounded-3xl flex items-center justify-center border border-brand-neon/20 shadow-glow group hover:scale-110 transition-transform duration-500">
            <KeyRound className="w-10 h-10 text-brand-neon group-hover:animate-pulse" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon mb-4">
            <Zap className="w-3 h-3" />
            Security Protocol
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-3">
            Forgot <span className="text-brand-neon neon-text">Password?</span>
          </h2>
          <p className="text-brand-secondary font-medium opacity-60 leading-relaxed text-sm">
            Enter your email address to reset your password and regain access to your account.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-8 animate-slide-up">
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <p className="text-emerald-400 font-black text-xs uppercase tracking-widest leading-relaxed">{message}</p>
            </div>
            <Link to="/login" className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
              <ChevronLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                {message}
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-neon transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-brand-neon hover:bg-brand-accent disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-glow hover:scale-[1.02] active:scale-95"
            >
              {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Reset Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
                Remembered your password? <Link to="/login" className="text-brand-neon hover:text-brand-accent transition-colors ml-1">Login</Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

