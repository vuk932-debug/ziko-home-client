import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, User as UserIcon, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';

declare global {
  interface Window {
    initSendOTP: (config: any) => void;
    sendOtp: (identifier: string, success?: (data: any) => void, failure?: (error: any) => void) => void;
    verifyOtp: (otp: string, success?: (data: any) => void, failure?: (error: any) => void) => void;
    retryOtp: (channel: string | null, success?: (data: any) => void, failure?: (error: any) => void) => void;
  }
}

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, login, isAuthenticated, user, redirectAfterLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Registration data
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Redirection
  useEffect(() => {
    if (isAuthenticated && user && isLoginModalOpen) {
      closeLoginModal();
      const role = user.role;
      if (role === 'Admin') navigate('/admin', { replace: true });
      else if (role === 'CP') navigate('/cp', { replace: true });
      else if (role === 'WRITER') navigate('/writer/dashboard', { replace: true });
      else if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, isLoginModalOpen, closeLoginModal, navigate, redirectAfterLogin]);

  // Initialize MSG91 Exposed Methods
  useEffect(() => {
    if (!isLoginModalOpen) return;

    const configuration = {
      widgetId: "3665676a4d72303230363036",
      tokenAuth: "514644TeCQrLJfVk69ff7ba5P1", // Standardized Token
      exposeMethods: true,
      captchaRenderId: 'msg91-captcha', 
      success: (data: any) => {
        console.log('MSG91 Global Success', data);
      },
      failure: (error: any) => {
        console.error('MSG91 Global Failure', error);
      },
    };

    const loadScript = () => {
      const existingScript = document.getElementById('msg91-otp-script');
      if (existingScript) {
        if (window.initSendOTP) window.initSendOTP(configuration);
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'msg91-otp-script';
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.async = true;
      script.onload = () => {
        if (window.initSendOTP) window.initSendOTP(configuration);
      };
      document.head.appendChild(script);
    };

    loadScript();
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
  }, [isLoginModalOpen]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Enter a valid 10-digit number');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    // identifier must contain country code without +
    const identifier = `91${phone}`;
    
    window.sendOtp(
      identifier,
      (data) => {
        console.log('OTP Sent:', data);
        setStep(2);
        setResendTimer(60);
        setIsLoading(false);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      },
      (err) => {
        console.error('Send OTP Error:', err);
        setError('Failed to send OTP. Check your number.');
        setIsLoading(false);
      }
    );
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    window.retryOtp(
      null,
      (_data) => {
        setResendTimer(60);
        setIsResending(false);
      },
      (_err) => {
        setError('Resend failed');
        setIsResending(false);
      }
    );
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError('');

    window.verifyOtp(
      code,
      async (data) => {
        console.log('OTP Verified by Widget (Modal):', data);
        try {
          // Send the access token to our backend to create session
          const response = await apiClient.post('/auth/verify-widget', {
            accessToken: data.message,
            name,
            email
          });
          console.log('Backend Session established (Modal):', response.data);
          login(response.data.user, response.data.accessToken);
        } catch (err: any) {
          console.error('Backend verification error (Modal):', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Login failed');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Widget verification failure (Modal):', err);
        setError('Invalid code. Please try again.');
        setIsLoading(false);
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeLoginModal} />

      <div className="relative glass-morphism w-full max-w-md rounded-3xl overflow-hidden animate-slide-up border-white/10 shadow-glow-lg">
        <button onClick={closeLoginModal} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-500 hover:bg-white/20 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">
              {step === 1 ? 'Step Into' : 'Verify Identity'}
            </h2>
            <p className="text-brand-secondary text-xs font-bold uppercase tracking-widest opacity-60">
              {step === 1 ? 'Premium Real Estate Network' : `Code sent to +91 ${phone}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="relative group">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-neon transition-colors" />
                <div className="flex items-center w-full bg-white/5 border border-white/5 rounded-2xl group-focus-within:border-brand-neon group-focus-within:ring-1 group-focus-within:ring-brand-neon transition-all overflow-hidden">
                  <span className="pl-12 pr-2 text-brand-secondary font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                    className="flex-1 pr-4 py-4 bg-transparent text-white placeholder:text-brand-muted focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-neon transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-neon transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                />
              </div>

              {/* Hidden Captcha div required by MSG91 */}
              <div id="msg91-captcha" className="mb-4"></div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full !py-4 mt-4 text-xs font-black uppercase tracking-[0.2em]">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-10">
              <div className="flex justify-between gap-3 max-w-[340px] mx-auto">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
                    }}
                    className="w-12 h-16 text-center text-2xl font-black bg-white/5 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all shadow-glow"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button type="submit" disabled={isLoading} className="btn-primary w-full !py-4 text-xs font-black uppercase tracking-[0.2em]">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Continue'} 
                </button>

                <div className="flex flex-col items-center gap-4">
                  <button type="button" onClick={handleResendOTP} disabled={resendTimer > 0 || isResending} className={`text-[10px] font-black uppercase tracking-widest transition-all ${resendTimer > 0 ? 'text-brand-muted' : 'text-brand-neon hover:text-brand-accent underline underline-offset-4 decoration-brand-neon/30'}`}>
                    {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
