import { useState, useEffect, useRef } from 'react';
import { X, Phone, User, Mail, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/axios';
import { leadSchema } from '../../shared/schemas/lead.schema';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  source?: string;
}

const LeadCaptureModal = ({ isOpen, onClose, propertyId, propertyName, source = 'property_details_page' }: LeadCaptureModalProps) => {
  const { showNotification } = useNotification();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [step, setStep] = useState<'DETAILS' | 'OTP' | 'SUCCESS'>('DETAILS');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill data if authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setFormData({
        name: user.name || '',
        phone: user.phone?.replace('+91', '') || '',
        email: user.email || ''
      });
    }
  }, [isOpen, isAuthenticated, user]);

  // Initialize MSG91 for Lead Verification
  useEffect(() => {
    if (!isOpen || isAuthenticated || step !== 'DETAILS') return;

    const configuration = {
      widgetId: "3665676a4d72303230363036", // Standardized Widget ID
      tokenAuth: "514644AgsSOf1wcDT6a03794eP1", // User Confirmed Key
      exposeMethods: true,
      captchaRenderId: 'msg91-captcha-lead',
      success: (data: any) => console.log('MSG91 Lead Success', data),
      failure: (error: any) => console.error('MSG91 Lead Failure', error),
    };

    const loadScript = () => {
      if (window.initSendOTP) {
        window.initSendOTP(configuration);
      } else {
        const script = document.createElement('script');
        script.id = 'msg91-otp-script-lead';
        script.src = 'https://verify.msg91.com/otp-provider.js';
        script.async = true;
        script.onload = () => { if (window.initSendOTP) window.initSendOTP(configuration); };
        document.head.appendChild(script);
      }
    };

    loadScript();
  }, [isOpen, isAuthenticated, step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = leadSchema.safeParse({ ...formData, propertyId, source: source === 'contact_agent' ? 'PROPERTY_VIEW' : source });
    if (!validation.success) {
      showNotification('error', validation.error.issues[0].message);
      return;
    }

    if (isAuthenticated) return submitDirectLead(validation.data);

    setLoading(true);
    try {
      // Step 1: Check if user exists (to prevent duplicate accounts via lead flow)
      const { data } = await apiClient.get(`/auth/validate-user-existence?identifier=${formData.phone}`);
      
      if (data.user_found) {
        showNotification('info', 'Account detected. Please login to continue.');
        onClose();
        openLoginModal(window.location.pathname);
        return;
      }

      // Step 2: Trigger MSG91 OTP
      const phoneWithCode = `91${formData.phone.replace('+91', '')}`;
      window.sendOtp(
        phoneWithCode,
        () => {
          setLoading(false);
          setStep('OTP');
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        },
        (_err) => {
          setLoading(false);
          showNotification('error', 'Failed to transmit verification protocol.');
        }
      );
    } catch (err) {
      setLoading(false);
      showNotification('error', 'Communication error. Please try again.');
    }
  };

  const submitDirectLead = async (validatedData?: any) => {
    setLoading(true);
    try {
      const payload = validatedData || {
        ...formData,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
        propertyId,
        source: source
      };

      await apiClient.post('/leads', payload);
      setStep('SUCCESS');
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setLoading(true);
    window.verifyOtp(
      code,
      async (data) => {
        console.log('OTP Verified by Widget (Lead):', data);
        try {
          // Send the MSG91 accessToken to our backend
          await apiClient.post('/leads/verify-widget', {
            ...formData,
            accessToken: data.message,
            propertyId,
            source: source
          });
          console.log('Lead captured successfully');
          setStep('SUCCESS');
        } catch (err: any) {
          console.error('Lead backend verification error:', err.response?.data || err.message);
          showNotification('error', err.response?.data?.message || 'Verification failed');
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Widget verification failure (Lead):', err);
        setLoading(false);
        showNotification('error', 'Invalid verification code.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.split('').slice(0, 6);
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/90 backdrop-blur-2xl overflow-y-auto">
      <div className="glass-card rounded-[2.5rem] border-white/10 w-full max-w-lg my-auto overflow-hidden shadow-glow-lg animate-fade-in">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
            {source === 'schedule_inspection' ? (
               <><span className="text-brand-neon">Schedule</span> Visit</>
            ) : (
               <><span className="text-brand-neon">Contact</span> Partner</>
            )}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-all text-brand-secondary hover:text-white border border-transparent hover:border-white/5"><X size={20}/></button>
        </div>

        <div className="p-10">
          {step === 'DETAILS' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <p className="text-brand-secondary text-sm leading-relaxed opacity-80">
                {source === 'schedule_inspection' 
                  ? `Initiating geospatial inspection protocol for `
                  : `Acquisition intelligence request for `}
                <span className="text-white font-black">{propertyName}</span>. 
                {isAuthenticated ? ' Confirm your details below to establish connection.' : ' Complete biometric link to proceed.'}
              </p>
              
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Full Identity Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors" size={18}/>
                      <input required className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20" 
                        value={formData.name} autoComplete="name" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Wick"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Secure Contact Vector (Phone)</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors" size={18}/>
                      <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all font-mono placeholder:opacity-20" 
                        value={formData.phone} autoComplete="tel" onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="98765 43210"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] opacity-60 ml-1">Electronic Mail (Optional)</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-neon transition-colors" size={18}/>
                      <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all placeholder:opacity-20" 
                        value={formData.email} autoComplete="email" onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@matrix.net"/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Verified Identity</div>
                      <div className="text-white font-bold">{user?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Contact Vector</div>
                      <div className="text-white font-bold">{user?.phone}</div>
                    </div>
                  </div>
                  {user?.email && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-brand-secondary uppercase tracking-widest opacity-60">Electronic Mail</div>
                        <div className="text-white font-bold">{user.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden Captcha div required by MSG91 */}
              {!isAuthenticated && <div id="msg91-captcha-lead" className="mb-4"></div>}

              <button disabled={loading} type="submit" className="w-full py-5 bg-brand-neon hover:bg-brand-accent text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 mt-4 shadow-glow group">
                {loading ? <Loader2 className="animate-spin" size={20}/> : (
                  <>
                    {isAuthenticated ? 'Submit Request' : 'Initialize Verification'}
                    <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 text-center">
              <div className="w-20 h-20 bg-brand-neon/10 border border-brand-neon/20 rounded-[2rem] flex items-center justify-center mx-auto text-brand-neon shadow-glow-sm">
                <ShieldCheck size={36} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black text-xl tracking-tight uppercase">Protocol Verification</h3>
                <p className="text-brand-secondary text-sm opacity-70">Transmission sent to <span className="text-brand-neon font-bold">{formData.phone}</span></p>
              </div>
              <div className="flex justify-between gap-2">
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
                    className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                  />
                ))}
              </div>
              <button disabled={loading} type="submit" className="w-full py-5 bg-brand-neon hover:bg-brand-accent text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-glow group">
                {loading ? <Loader2 className="animate-spin" size={20}/> : (
                  <>
                    Complete Synchronization
                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="space-y-8 text-center py-4">
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={56} className="animate-in zoom-in duration-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-white font-black text-2xl tracking-tighter uppercase">Inquiry Synced</h3>
                <p className="text-brand-secondary text-sm leading-relaxed max-w-xs mx-auto">Asset node ownership notified. A partner agent will establish a secure link regarding <span className="text-white font-bold">{propertyName}</span> shortly.</p>
              </div>
              <button onClick={onClose} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all border border-white/5">
                Terminate Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
