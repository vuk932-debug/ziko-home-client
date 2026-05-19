import { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as blogApi from '../api/blogApi';
import type { Blog as BlogType } from '../api/blogApi';

/**
 * Blog — The primary entry point for the ZikoHome Blog ecosystem.
 */
const Blog = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogApi.fetchPublicBlogs({ limit: 10 });
        setBlogs(data.blogs);
      } catch (err) {
        console.error('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Decrypting Insights...</p>
    </div>
  );

  return (
    <div className="space-y-20">
      
      {/* ── Blog Header ─────────────────────────────────── */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-brand-neon">
          <Sparkles className="w-3.5 h-3.5" />
          Insight Protocol
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
          Ziko <span className="text-brand-neon neon-text">Insights.</span>
        </h1>
        <p className="text-brand-secondary text-lg md:text-xl font-medium opacity-70 max-w-2xl mx-auto">
          Deep dives into the technology, market intelligence, and architecture 
          shaping the future of premium real estate.
        </p>
      </section>

      {/* ── Feed Section ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto space-y-12 pb-32">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">Latest intelligence reports</h3>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-neon">
              <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
              Live Feed
           </div>
        </div>

        {blogs.map((post) => (
          <div key={post.id} className="group flex flex-col md:flex-row gap-8 md:gap-12 py-10 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all rounded-[2rem] md:px-8 -mx-4 md:-mx-8">
            {/* Image on the Left */}
            <div className="w-full md:w-[400px] shrink-0">
               <div className="aspect-[16/10] bg-white/5 rounded-3xl border border-white/5 overflow-hidden relative">
                  {post.featuredImage ? (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted/20 text-[10px] font-black uppercase tracking-[0.3em]">No Visual Data</div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[9px] font-black text-brand-neon uppercase tracking-widest">
                     Sector Analysis
                  </div>
               </div>
            </div>
            
            {/* Content on the Right */}
            <div className="flex-1 flex flex-col justify-between py-2">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-brand-neon" /> {post.author.name}</div>
                     <div className="w-1 h-1 rounded-full bg-white/10" />
                     <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-brand-neon" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-brand-neon transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-brand-secondary text-base leading-relaxed opacity-70 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 180) + '...'}
                  </p>
               </div>

               <div className="pt-8 flex items-center justify-between">
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em] group/btn"
                  >
                    Initialize Decryption
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/btn:bg-brand-neon group-hover/btn:border-brand-neon group-hover/btn:text-black transition-all">
                       <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                     <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Protocol ID: {post.id.substring(0, 8)}</span>
                  </div>
               </div>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="text-center py-32 space-y-6 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-brand-muted opacity-20" />
             </div>
             <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.5em] opacity-40">No intelligence reports currently synchronized.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default Blog;
