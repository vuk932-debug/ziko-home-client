import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import * as blogApi from '../api/blogApi';
import type { Blog } from '../api/blogApi';
import EngagementButtons from '../components/common/EngagementButtons';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (slug) {
          const data = await blogApi.fetchPublicBlogBySlug(slug);
          setBlog(data);
        }
      } catch (err) {
        console.error('Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Accessing Data Node...</p>
    </div>
  );

  if (!blog) return (
    <div className="text-center py-32 space-y-6">
       <h1 className="text-4xl font-black text-white">404: Node Missing</h1>
       <p className="text-brand-secondary">The intelligence report you are looking for has been decommissioned or moved.</p>
       <Link to="/blog" className="btn-primary inline-flex items-center gap-2 !py-3">
         <ArrowLeft className="w-4 h-4" /> Return to Grid
       </Link>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-12 pb-32">
      <Link to="/blog" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-neon transition-all text-[10px] font-black uppercase tracking-widest">
         <ArrowLeft className="w-4 h-4" /> Back to Intelligence Grid
      </Link>

      <div className="space-y-6">
         <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-brand-neon">
            <Sparkles className="w-3.5 h-3.5" />
            Intelligence Report
         </div>
         <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
            {blog.title}
         </h1>
         
         <div className="flex flex-wrap items-center justify-between gap-8 pt-4 border-b border-white/5 pb-8">
            <div className="flex flex-wrap items-center gap-8 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
               <div className="flex items-center gap-2"><User className="w-4 h-4 text-brand-neon" /> {blog.author.name}</div>
               <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-neon" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</div>
            </div>
            
            <EngagementButtons 
              entityId={blog.id} 
              entityType="BLOG" 
              slug={blog.slug} 
              title={blog.title} 
            />
         </div>
      </div>

      {blog.featuredImage && (
        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden aspect-video">
           <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-p:text-brand-secondary prose-p:leading-relaxed prose-a:text-brand-neon">
        {blog.content.split('\n').map((para, i) => (
          para.trim() ? <p key={i} className="mb-4">{para}</p> : <br key={i} />
        ))}
      </div>
    </div>
  );
};

export default BlogDetail;
