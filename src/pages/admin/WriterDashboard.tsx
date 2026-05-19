import { useState, useEffect } from 'react';
import { Plus, Edit, Send, Trash2, Loader2, Sparkles, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as blogApi from '../../api/blogApi';
import type { Blog } from '../../api/blogApi';
import { useNotification } from '../../context/NotificationContext';

const WriterDashboard = () => {
  const { showNotification, confirm } = useNotification();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogApi.fetchAdminBlogs({ limit: 50 });
      setBlogs(data.blogs);
    } catch (err) {
      console.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      await blogApi.submitBlogForReview(id);
      fetchMyBlogs();
      showNotification('success', 'Protocol submitted for review');
    } catch (err) {
      showNotification('error', 'Failed to submit for review');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Protocol',
      message: 'Are you sure you want to permanently delete this intelligence post?',
      type: 'danger',
      confirmText: 'Delete Post'
    });
    if (!confirmed) return;
    try {
      await blogApi.deleteBlog(id);
      fetchMyBlogs();
      showNotification('success', 'Protocol deleted');
    } catch (err) {
      showNotification('error', 'Failed to delete blog');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REVIEW': return <Clock className="w-4 h-4 text-brand-accent" />;
      case 'DRAFT': return <AlertCircle className="w-4 h-4 text-brand-muted" />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Insights...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Sparkles className="w-3 h-3" />
            Writer Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">My <span className="text-brand-neon neon-text">Insights</span></h1>
          <p className="text-brand-secondary font-medium opacity-70">Manage your published intelligence and drafting protocols.</p>
        </div>
        
        <Link to="/writer/editor/new" className="btn-primary flex items-center gap-2 !py-4 !px-8 shadow-glow">
          <Plus className="w-5 h-5" />
          Create New Protocol
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {blogs.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] border-white/5 p-20 text-center space-y-4">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-brand-muted" />
             </div>
             <h3 className="text-xl font-black text-white">No active protocols detected.</h3>
             <p className="text-brand-secondary text-sm max-w-md mx-auto opacity-70">Begin your first intelligence report to start populating the ZikoHome insight grid.</p>
          </div>
        ) : (
          <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">Post Title</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">Created</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-white font-bold tracking-tight">{blog.title}</p>
                      <p className="text-[10px] text-brand-secondary opacity-60 truncate max-w-xs">{blog.slug}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(blog.status)}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          blog.status === 'PUBLISHED' ? 'text-emerald-500' : 
                          blog.status === 'REVIEW' ? 'text-brand-accent' : 'text-brand-muted'
                        }`}>
                          {blog.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest opacity-60">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {blog.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleSubmitForReview(blog.id)}
                            className="p-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
                            title="Submit for Review"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <Link 
                          to={`/writer/editor/${blog.id}`}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-brand-neon hover:text-black hover:border-brand-neon transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {blog.status !== 'PUBLISHED' && (
                          <button 
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriterDashboard;
