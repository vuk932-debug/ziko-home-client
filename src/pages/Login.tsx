import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Target,
  Smartphone,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";
import ZikoLogo from "../assets/ZikoLogoWhite.png";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  
  // Login Mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  
  // Password Mode States
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Mode States
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MSG91 for Standalone Page
  useEffect(() => {
    if (loginMode !== 'otp') return;

    const configuration = {
      widgetId: "3665676a4d72303230363036",
      tokenAuth: "514644TeCQrLJfVk69ff7ba5P1", // Standardized Token
      exposeMethods: true,
      captchaRenderId: 'msg91-captcha-page',
      success: (data: any) => console.log('MSG91 Page Success', data),
      failure: (error: any) => console.error('MSG91 Page Failure', error),
    };

    const loadScript = () => {
      if (document.getElementById('msg91-otp-script')) {
        if (window.initSendOTP) window.initSendOTP(configuration);
        return;
      }
      const script = document.createElement('script');
      script.id = 'msg91-otp-script';
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.async = true;
      script.onload = () => { if (window.initSendOTP) window.initSendOTP(configuration); };
      document.head.appendChild(script);
    };

    loadScript();
  }, [loginMode]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === "Admin") navigate("/admin", { replace: true });
      else if (role === "CP") navigate("/cp", { replace: true });
      else if (role === "WRITER") navigate("/writer/dashboard", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Required identifiers missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post("/auth/login", form);
      login(data.user, data.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || "Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!name.trim()) {
      setError("Name is required for secure session");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (typeof window.sendOtp !== 'function') {
      setError("Auth system starting... please wait 2 seconds");
      setIsLoading(false);
      return;
    }

    window.sendOtp(
      `91${phone}`,
      (_data) => {
        setOtpStep(2);
        setResendTimer(60);
        setIsLoading(false);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      },
      (_err) => {
        setError("Failed to transmit OTP. Verify number.");
        setIsLoading(false);
      }
    );
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    window.retryOtp(null, () => {
      setResendTimer(60);
      setIsResending(false);
    }, () => setIsResending(false));
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError(null);

    window.verifyOtp(code, async (data) => {
      console.log('OTP Verified by Widget:', data);
      try {
        const response = await apiClient.post('/auth/verify-widget', {
          accessToken: data.message,
          name,
          email
        });
        console.log('Backend Session established:', response.data);
        login(response.data.user, response.data.accessToken);
      } catch (err: any) {
        console.error('Backend verification error:', err.response?.data || err.message);
        setError(err.response?.data?.message || "Verification sync failure");
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      console.error('Widget verification failure callback:', err);
      setError("Invalid code provided");
      setIsLoading(false);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    });
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-hero-gradient overflow-hidden">
        {/* Animated Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-brand-neon/10 rounded-full filter blur-[120px] animate-pulse-glow" />

        <div className="relative z-10 flex flex-col justify-center px-24 text-white">
          <div className="flex items-center mb-16">
            <img src={ZikoLogo} alt="ZikoHome Logo" className="h-14 w-auto object-contain" />
          </div>

          <div className="space-y-6">
            <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
              Step Into <br />
              <span className="text-brand-neon neon-text">Trusted Property.</span>
            </h2>
            <p className="text-brand-secondary text-xl font-medium opacity-70 leading-relaxed max-w-md">
              Where verified properties meet smarter decisions.
            </p>
          </div>

          <div className="mt-20 space-y-8">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                text: "Encrypted Listing Data",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                text: "Real-time Market Sync",
              },
              {
                icon: <Target className="w-5 h-5" />,
                text: "Precision Search Engine",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="flex items-center gap-4 text-brand-secondary group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-neon/50 transition-all duration-300">
                  <span className="text-brand-neon">{feat.icon}</span>
                </div>
                <span className="font-bold uppercase tracking-widest text-xs opacity-80 group-hover:opacity-100">
                  {feat.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #8B5CF6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 overflow-y-auto py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center mb-12 lg:hidden">
            <img src={ZikoLogo} alt="ZikoHome Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter">
              {loginMode === 'password' ? 'Login' : otpStep === 1 ? 'Quick Access' : 'Verify Identity'}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-brand-secondary font-medium">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-brand-neon hover:text-brand-accent font-bold transition-all underline underline-offset-4 decoration-brand-neon/30"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Toggle Login Mode */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => { setLoginMode('password'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'password' ? 'bg-brand-neon text-brand-bg shadow-glow' : 'text-brand-muted hover:text-white'}`}
            >
              Password Login
            </button>
            <button
              onClick={() => { setLoginMode('otp'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'otp' ? 'bg-brand-neon text-brand-bg shadow-glow' : 'text-brand-muted hover:text-white'}`}
            >
              OTP Login
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 text-red-400 text-xs font-bold animate-slide-up">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="uppercase tracking-widest leading-relaxed">
                {error}
              </span>
            </div>
          )}

          {loginMode === 'password' ? (
            <form
              id="login-form"
              onSubmit={handlePasswordSubmit}
              className="space-y-6"
              noValidate
            >
              {/* Email */}
              <div className="space-y-3">
                <label
                  htmlFor="login-email"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    virtual-link="true"
                    className="text-[10px] font-black uppercase tracking-widest text-brand-neon hover:text-brand-accent transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full !py-5 mt-4 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          ) : (
            /* OTP LOGIN FLOW */
            <div className="animate-slide-up">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
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
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Full Name (New Accounts)</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary opacity-60 ml-1">Email (Optional)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-neon w-5 h-5 transition-colors" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                      />
                    </div>
                  </div>

                  {/* Hidden Captcha div required by MSG91 */}
                  <div id="msg91-captcha-page" className="mb-4"></div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full !py-5 mt-4 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Verification"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-10">
                  <div className="text-center mb-8">
                    <p className="text-brand-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">
                      Code sent to +91 {phone}
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 max-w-[340px] mx-auto">
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
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full !py-5 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Establish Connection"}
                    </button>

                    <div className="flex flex-col items-center gap-4">
                      <button 
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || isResending}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${resendTimer > 0 ? 'text-brand-muted cursor-not-allowed' : 'text-brand-neon hover:text-brand-accent underline underline-offset-4 decoration-brand-neon/30'}`}
                      >
                        {isResending ? "Re-transmitting..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Verification Code"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setOtpStep(1)}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white transition-colors"
                      >
                        Reset Phone Number
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
