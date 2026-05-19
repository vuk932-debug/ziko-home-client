import { useState, useEffect } from 'react';
import { Heart, Share2, Copy, Send, Check, X, MessageCircle, Link } from 'lucide-react';
import * as engagementApi from '../../api/engagementApi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface EngagementButtonsProps {
  entityId: string;
  entityType: engagementApi.EntityType;
  slug: string;
  title: string;
}

const EngagementButtons = ({ entityId, entityType, slug, title }: EngagementButtonsProps) => {
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState<engagementApi.EngagementStats>({ count: 0, isLiked: false });
  const [isShareModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/${entityType.toLowerCase() === 'blog' ? 'blog' : 'property'}/${slug}`;

  useEffect(() => {
    fetchStats();
  }, [entityId, entityType]);

  const fetchStats = async () => {
    try {
      const data = await engagementApi.fetchEngagementStats(entityId, entityType);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showNotification('info', 'Please log in to like this protocol.');
      return;
    }
    try {
      const result = await engagementApi.toggleLike(entityId, entityType);
      setStats(prev => ({
        count: result.liked ? prev.count + 1 : prev.count - 1,
        isLiked: result.liked
      }));
    } catch (err) {
      console.error('Like operation failed');
    }
  };

  const handleShare = async (platform: string) => {
    try {
      await engagementApi.trackShare(entityId, entityType, platform);
      let url = '';
      const text = encodeURIComponent(`Check out this Ziko intelligence: ${title}`);
      
      switch (platform) {
        case 'WhatsApp':
          url = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`;
          break;
        case 'X':
          url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'LinkedIn':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'Facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
      }
      if (url) window.open(url, '_blank');
    } catch (err) {
      console.error('Share tracking failed');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    engagementApi.trackShare(entityId, entityType, 'CopyLink');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Like Button */}
      <button 
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
          stats.isLiked 
            ? 'bg-brand-neon/10 border-brand-neon/30 text-brand-neon shadow-glow-sm' 
            : 'bg-white/5 border-white/10 text-brand-muted hover:border-white/20 hover:text-white'
        }`}
      >
        <Heart size={18} className={stats.isLiked ? 'fill-current' : ''} />
        <span className="text-[10px] font-black uppercase tracking-widest">{stats.count}</span>
      </button>

      {/* Share Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-brand-muted hover:border-brand-neon/30 hover:text-brand-neon transition-all"
      >
        <Share2 size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest text-white">Share</span>
      </button>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/80 backdrop-blur-xl animate-fade-in">
          <div className="glass-card border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-glow-lg animate-slide-up">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Distribute <span className="text-brand-neon">Intelligence</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-secondary"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-8">
               <div className="grid grid-cols-4 gap-4">
                  {[
                    { id: 'WhatsApp', icon: <Send size={20} />, color: 'bg-emerald-500' },
                    { id: 'X', icon: <X size={20} />, color: 'bg-black border border-white/10' },
                    { id: 'LinkedIn', icon: <Link size={20} />, color: 'bg-blue-600' },
                    { id: 'Facebook', icon: <MessageCircle size={20} />, color: 'bg-blue-500' }
                  ].map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => handleShare(p.id)}
                      className={`w-full aspect-square rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 ${p.color}`}
                    >
                      {p.icon}
                    </button>
                  ))}
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Secure Protocol Link</label>
                  <div className="relative group">
                     <input 
                       readOnly 
                       value={shareUrl}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-[10px] font-mono text-brand-secondary truncate focus:outline-none"
                     />
                     <button 
                        onClick={copyLink}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-brand-neon hover:text-black rounded-xl transition-all"
                     >
                        {copied ? <Check size={14}/> : <Copy size={14}/>}
                     </button>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-6 bg-white/5 text-brand-muted text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all border-t border-white/5"
            >
              Abort Distribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementButtons;
