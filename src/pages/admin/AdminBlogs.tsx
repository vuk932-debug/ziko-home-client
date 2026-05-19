import { useState, useEffect } from 'react';
import { Check, X, Loader2, Sparkles, User, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import * as blogApi from '../../api/blogApi';
import type { Blog } from '../../api/blogApi';
import { useNotification } from '../../context/NotificationContext';

const AdminBlogs = () => {
  const { showNotification, confirm } = useNotification();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('REVIEW');

  useEffect(() => {
    fetchBlogs();
  }, [filterStatus]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogApi.fetchAdminBlogs({ status: filterStatus, limit: 50 });
      setBlogs(data.blogs);
    } catch (err) {
      console.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await blogApi.adminPublishBlog(id);
      showNotification('success', 'Intelligence report published to the public grid.');
      fetchBlogs();
    } catch (err) {
      showNotification('error', 'Failed to publish');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await blogApi.adminRejectBlog(id);
      showNotification('info', 'Report rejected and returned to drafting sector.');
      fetchBlogs();
    } catch (err) {
      showNotification('error', 'Failed to reject');
    }
  };

  const handleDelete = async (blog: Blog) => {
    const confirmed = await confirm({
      title: 'Confirm Data Purge',
      message: `This action will remove "${blog.title}" from the active database. Proceed with decommissioning?`,
      type: 'danger',
      confirmText: 'Purge Intelligence'
    });

    if (!confirmed) return;

    try {
      await blogApi.deleteBlog(blog.id);
      showNotification('success', 'Blog node successfully purged from the database.');
      fetchBlogs();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Purge protocol failed.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Global Insights...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Sparkles className="w-3 h-3" />
            Editorial Control
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Insight <span className="text-brand-neon neon-text">Review</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Approve or reject intelligence reports before global synchronization.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {['REVIEW', 'PUBLISHED', 'DRAFT'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status ? 'bg-brand-neon text-black shadow-glow' : 'text-brand-muted hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {blogs.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] border-white/5 p-20 text-center space-y-4">
             <h3 className="text-xl font-black text-white">Grid Clean.</h3>
             <p className="text-brand-secondary text-sm opacity-70">No reports currently pending editorial review in this sector.</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className="glass-card rounded-[2.5rem] border-white/5 p-8 md:p-10 flex flex-col md:flex-row gap-10 hover:border-brand-neon/20 transition-all group">
               <div className="w-full md:w-1/3 aspect-video bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                  {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted/20 text-[10px] font-black uppercase tracking-[0.3em]">No Visual Data</div>
                  )}
               </div>
               
               <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                       <h2 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-brand-neon transition-colors">
                         {blog.title}
                       </h2>
                       <div className="flex items-center gap-6 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-brand-neon" /> {blog.author.name}</div>
                          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-brand-neon" /> {new Date(blog.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-brand-muted hover:text-brand-neon hover:border-brand-neon transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(blog)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-brand-muted hover:text-red-500 hover:border-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-brand-secondary text-sm leading-relaxed opacity-70 line-clamp-3">
                    {blog.excerpt || blog.content.substring(0, 200) + '...'}
                  </p>

                  <div className="flex items-center gap-4 pt-4">
                    {blog.status === 'REVIEW' && (
                      <>
                        <button 
                          onClick={() => handlePublish(blog.id)}
                          className="flex-1 bg-brand-neon/10 border border-brand-neon/20 text-brand-neon py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-neon hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve & Synchronize
                        </button>
                        <button 
                          onClick={() => handleReject(blog.id)}
                          className="px-8 border border-white/5 text-brand-muted py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {blog.status === 'PUBLISHED' && (
                       <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          Post Live on Public Grid
                       </div>
                    )}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
