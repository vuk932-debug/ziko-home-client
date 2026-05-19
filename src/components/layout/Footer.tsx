import { Link } from "react-router-dom";
import { Mail, Phone, MessageSquare, Globe, Code2 } from "lucide-react";
import ZikoLogo from "../../assets/ZikoLogoWhite.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-deep text-brand-secondary border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-neon/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center">
              <img
                src={ZikoLogo}
                alt="ZikoHome Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-brand-secondary text-base leading-relaxed max-w-sm opacity-80">
              The future of modern living starts here. We combine futuristic
              technology with premium real estate to help you find, trust, and
              own your dream space.
            </p>
            <div className="flex items-center gap-5 pt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-neon hover:text-white hover:shadow-glow transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-neon hover:text-white hover:shadow-glow transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-neon hover:text-white hover:shadow-glow transition-all duration-300"
              >
                <Code2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">
              Platform
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-sm font-medium hover:text-brand-neon transition-all hover:pl-2"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-sm font-medium hover:text-brand-neon transition-all hover:pl-2"
                >
                  Premium Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-sm font-medium hover:text-brand-neon transition-all hover:pl-2"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-sm font-medium hover:text-brand-neon transition-all hover:pl-2"
                >
                  Partner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">
              Support
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href="mailto:it.support@zikohome.com"
                  className="text-sm font-medium hover:text-brand-neon transition-all"
                >
                  it.support@zikohome.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                  <Phone className="w-4 h-4" />
                </div>
                <a
                  href="tel:+919148144264"
                  className="text-sm font-medium hover:text-brand-neon transition-all"
                >
                  +91 914814 4264
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-neon/10 flex-shrink-0 flex items-center justify-center text-brand-neon">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium leading-relaxed opacity-80">
                  #72 Ramanjineya layout Marathahalli Bangalore, 560037
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-widest opacity-60">
          <p>© {currentYear} ZIKO HOME GLOBAL. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-neon transition-all">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-brand-neon transition-all">
              Terms of Access
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
