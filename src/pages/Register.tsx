import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Zap, Globe, Smartphone } from 'lucide-react';
import apiClient from '../api/axios';
import { userSchema } from '../shared/schemas/user.schema';
import ZikoLogo from '../assets/ZikoLogoWhite.png';
import { useAuth } from '../context/AuthContext';

type Role = 'Customer';

interface RegisterForm {
  name: string;
  email: string;
  phonePrefix: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const getPasswordStrength = (pwd: string): PasswordStrength => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-blue-500' },
    { score: 4, label: 'Strong', color: 'bg-brand-neon' },
  ];
  return levels[score] || levels[0];
};

const Register = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    phonePrefix: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
  });
  
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const passwordStrength = getPasswordStrength(form.password);

  // Redirection for logged-in users
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === "Admin") navigate("/admin", { replace: true });
      else if (user.role === "CP") navigate("/cp", { replace: true });
      else if (user.role === "WRITER") navigate("/writer/dashboard", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Timer logic for OTP resend
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Initialize MSG91 Widget
  useEffect(() => {
    const configuration = {
      widgetId: "3665676a4d72303230363036",
      tokenAuth: "514644TeCQrLJfVk69ff7ba5P1", 
      exposeMethods: true,
      captchaRenderId: 'msg91-captcha-reg', 
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
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Step 1 details with Zod
    const dataToValidate = {
      ...form,
      phone: `+91${form.phone}`
    };
    
    const validation = userSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        if (!errors[path]) errors[path] = issue.message;
      });
      setFieldErrors(errors);
      setError(validation.error.issues[0].message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    // Use MSG91 Widget to send OTP
    const identifier = `91${form.phone}`;
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

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError('');

    window.verifyOtp(
      code,
      async (data) => {
        console.log('OTP Verified by Widget (Register):', data);
        try {
          // Final Registration with Access Token
          await apiClient.post('/auth/register', {
            name: form.name,
            email: form.email,
            phone: `+91${form.phone}`,
            password: form.password,
            role: form.role,
            accessToken: data.message // The MSG91 verified token
          });
          setSuccess(true);
          setTimeout(() => navigate('/login'), 2500);
        } catch (err: any) {
          console.error('Registration failed:', err.response?.data || err.message);
          const errorMessage = err.response?.data?.message;
          setError(Array.isArray(errorMessage) ? errorMessage[0].message : (errorMessage || 'Registration failed.'));
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Widget verification failure (Register):', err);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-[2rem] bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center mx-auto mb-8 shadow-glow animate-pulse-glow">
            <CheckCircle2 className="w-12 h-12 text-brand-neon" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Account Secured</h2>
          <p className="text-brand-secondary font-medium uppercase tracking-[0.2em] text-[10px]">Welcome to ZikoHome.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-bg">

      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-hero-gradient overflow-hidden">
        {/* Animated Glow */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-brand-neon/10 rounded-full filter blur-[120px] animate-pulse-glow" />
        
        <div className="relative z-10 flex flex-col justify-center px-24 text-white">
          <div className="flex items-center mb-16">
            <img src={ZikoLogo} alt="ZikoHome Logo" className="h-14 w-auto object-contain" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
              Join the <br />
              <span className="text-brand-neon neon-text">Next Generation.</span>
            </h2>
            <p className="text-brand-secondary text-xl font-medium opacity-70 leading-relaxed max-w-md">
              Secure your place in the future of real estate. High-trust, zero-friction ownership awaits.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6">
            {[
              { label: 'Global Assets', value: '1000+', icon: <Globe className="w-4 h-4" /> },
              { label: 'Verified Partners', value: '100+', icon: <ShieldCheck className="w-4 h-4" /> },
              { label: 'Network Nodes', value: '50K+', icon: <Zap className="w-4 h-4" /> },
              { label: 'System Uptime', value: '99.9%', icon: <Sparkles className="w-4 h-4" /> },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-brand-neon/30 transition-all duration-300">
                <div className="text-brand-neon mb-3">{s.icon}</div>
                <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
                <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(circle, #8B5CF6 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 overflow-y-auto py-20">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center mb-12 lg:hidden">
            <img src={ZikoLogo} alt="ZikoHome Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter">
              {step === 1 ? 'Create Account' : 'Verify Phone'}
            </h1>
            <p className="text-brand-secondary font-medium">
              {step === 1 ? (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-neon hover:text-brand-accent font-bold transition-all underline underline-offset-4 decoration-brand-neon/30">
                    Login
                  </Link>
                </>
              ) : (
                `Enter the 6-digit code sent to +91 ${form.phone}`
              )}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 text-red-400 text-xs font-bold animate-slide-up">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="uppercase tracking-widest leading-relaxed">{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6" noValidate>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all ${fieldErrors.name ? 'border-red-500/50' : 'border-white/5'}`}
                      required
                    />
                  </div>
                  {fieldErrors.name && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{fieldErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all ${fieldErrors.email ? 'border-red-500/50' : 'border-white/5'}`}
                        required
                      />
                    </div>
                    {fieldErrors.email && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{fieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                      <div className={`flex items-center w-full rounded-2xl bg-white/5 border group-focus-within:border-brand-neon group-focus-within:ring-1 group-focus-within:ring-brand-neon transition-all overflow-hidden ${fieldErrors.phone ? 'border-red-500/50' : 'border-white/5'}`}>
                        <span className="pl-12 pr-2 text-brand-secondary font-bold text-sm">+91</span>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) {
                              setForm(prev => ({ ...prev, phone: val }));
                              setFieldErrors(prev => ({ ...prev, phone: '' }));
                            }
                          }}
                          placeholder="10 Digits"
                          className="flex-1 pr-4 py-4 bg-transparent text-white placeholder:text-brand-muted focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                    {fieldErrors.phone && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{fieldErrors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 border text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all ${fieldErrors.password ? 'border-red-500/50' : 'border-white/5'}`}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{fieldErrors.password}</p>}
                  {form.password && (
                    <div className="px-1 flex items-center gap-3">
                      <div className="flex-1 flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted w-10">{passwordStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all
                        ${(fieldErrors.confirmPassword || (form.confirmPassword && form.password !== form.confirmPassword)) ? 'border-red-500/50' : 'border-white/5'}`}
                      required
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Hidden Captcha div required by MSG91 */}
              <div id="msg91-captcha-reg" className="mb-4"></div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full !py-5 mt-6 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-10">
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

              <div className="space-y-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full !py-5 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Register'}
                </button>

                <div className="flex flex-col items-center gap-4">
                  <button 
                    type="button" 
                    onClick={handleResendOTP} 
                    disabled={resendTimer > 0 || isResending} 
                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${resendTimer > 0 ? 'text-brand-muted' : 'text-brand-neon hover:text-brand-accent underline underline-offset-4 decoration-brand-neon/30'}`}
                  >
                    {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white transition-all"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            </form>
          )}

          <p className="text-[9px] font-bold text-center text-brand-muted uppercase tracking-[0.2em] leading-relaxed opacity-60 mt-10">
            By initializing registration, you consent to our{' '}
            <a href="#" className="text-brand-neon hover:text-brand-accent transition-colors">Access Protocols</a>
            {' '}and{' '}
            <a href="#" className="text-brand-neon hover:text-brand-accent transition-colors">Data Encryption Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
