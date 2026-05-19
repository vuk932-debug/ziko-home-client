import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Eye, X } from 'lucide-react';
import * as blogApi from '../../api/blogApi';
import type { Blog } from '../../api/blogApi';
import { useNotification } from '../../context/NotificationContext';

const BlogEditor = () => {
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const blog = await blogApi.fetchBlogById(id!);
      setFormData(blog);
      if (blog.featuredImage) {
        setImagePreview(blog.featuredImage);
      }
    } catch (err) {
      console.error('Failed to fetch blog');
      navigate('/writer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // If user manually enters a URL, update preview
    if (name === 'featuredImage' && value && !selectedFile) {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('error', 'Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
        e.target.value = ''; // Reset input
        return;
      }

      // File size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'File size exceeds 5MB limit. Please upload a smaller image.');
        e.target.value = ''; // Reset input
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      // Clean up previous featuredImage URL to prioritize the file
      setFormData(prev => ({ ...prev, featuredImage: '' }));
    }
  };

  const removeMedia = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, featuredImage: '' }));
    
    // Reset file input if it exists
    const fileInput = document.getElementById('featured-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSave = async () => {
    // Basic frontend validation
    if (!formData.title?.trim()) {
      showNotification('error', 'Title is required');
      return;
    }
    if (!formData.content?.trim()) {
      showNotification('error', 'Content is required');
      return;
    }
    if (formData.title.length > 150) {
      showNotification('error', 'Title must not exceed 150 characters');
      return;
    }
    if (formData.excerpt && formData.excerpt.length > 300) {
      showNotification('error', 'Excerpt must not exceed 300 characters');
      return;
    }
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      showNotification('error', 'SEO Title must not exceed 60 characters');
      return;
    }
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      showNotification('error', 'SEO Description must not exceed 160 characters');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...formData, imageFile: selectedFile || undefined };
      if (id === 'new' || !id) {
        await blogApi.createBlog(dataToSave);
      } else {
        await blogApi.updateBlog(id, dataToSave);
      }
      showNotification('success', 'Protocol successfully synchronized');
      navigate('/writer/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save protocol';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="animate-spin text-brand-neon w-12 h-12 shadow-glow" />
      <p className="text-brand-secondary text-xs font-black uppercase tracking-[0.3em]">Loading Protocol Data...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-brand-bg/90 backdrop-blur-xl overflow-y-auto">
           <div className="bg-brand-deep border border-white/10 rounded-[2.5rem] w-full max-w-4xl relative shadow-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-brand-deep/80 backdrop-blur z-10 shrink-0">
                 <div className="flex items-center gap-3 text-brand-neon font-black uppercase tracking-widest text-xs">
                    <Eye className="w-4 h-4" /> Live Preview
                 </div>
                 <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto overflow-x-hidden w-full h-full flex-1">
                 <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-8 break-words w-full">
                    {formData.title || 'Untitled Report'}
                 </h1>
                 {imagePreview && (
                   <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden aspect-video mb-12 w-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-p:text-brand-secondary prose-p:leading-relaxed prose-a:text-brand-neon break-words w-full overflow-hidden">
                    {formData.content?.split('\n').map((para, i) => (
                      para.trim() ? <p key={i} className="mb-4 break-words whitespace-pre-wrap">{para}</p> : <br key={i} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/writer/dashboard')}
          className="flex items-center gap-2 text-brand-secondary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Abort Initialization
        </button>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPreview(true)}
            className="px-6 py-2 rounded-xl border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !py-2.5 !px-8 flex items-center gap-2 shadow-glow"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {id === 'new' ? 'Initialize Protocol' : 'Update Protocol'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card rounded-[2.5rem] border-white/5 p-8 md:p-12 space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-neon flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Protocol Title
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a compelling title..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-brand-neon/50 transition-all placeholder:opacity-20"
                />
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Intelligence Content (Rich Text/Markdown)</label>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  placeholder="Decrypt your thoughts here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 text-brand-secondary focus:outline-none focus:border-brand-neon/50 transition-all placeholder:opacity-20 resize-none font-medium leading-relaxed"
                />
             </div>
          </section>

          <section className="glass-card rounded-[2.5rem] border-white/5 p-8 md:p-12 space-y-6">
             <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
               <ImageIcon className="w-4 h-4 text-brand-neon" />
               Visual Assets
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Upload Featured Image</label>
                      <div className="relative group cursor-pointer">
                         <input 
                           id="featured-image-upload"
                           type="file"
                           accept="image/jpeg, image/png, image/webp"
                           onChange={handleFileChange}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         <div className="border-2 border-dashed border-white/10 group-hover:border-brand-neon/50 rounded-2xl p-8 text-center transition-all bg-white/5">
                            <ImageIcon className="w-8 h-8 text-brand-muted group-hover:text-brand-neon mx-auto mb-3 transition-colors" />
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Select Intelligence Asset</p>
                            <p className="text-[9px] text-brand-secondary opacity-60 mt-1 uppercase tracking-tighter">JPEG, PNG, WEBP (Max 5MB)</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Or provide Media Link</label>
                      <input 
                        type="text"
                        name="featuredImage"
                        value={formData.featuredImage || ''}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-brand-secondary focus:outline-none focus:border-brand-neon/50 transition-all placeholder:opacity-20"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Neural Preview</label>
                     {imagePreview && (
                       <button 
                         onClick={removeMedia}
                         className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                       >
                         <X className="w-3 h-3" /> Clear Media
                       </button>
                     )}
                   </div>
                   <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
                      {imagePreview ? (
                        <>
                           <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-brand-neon/20 backdrop-blur-md px-4 py-2 rounded-full border border-brand-neon/30">Asset Loaded</span>
                           </div>
                        </>
                      ) : (
                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] opacity-20 text-center px-10">
                          Secure Media Placeholder Inactive
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card rounded-[2.5rem] border-white/5 p-8 space-y-6 sticky top-8">
             <h3 className="text-white font-black uppercase tracking-widest text-xs">SEO Metadata</h3>
             
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Search Title</label>
                <input 
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-neon/50 transition-all"
                />
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Search Description</label>
                <textarea 
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs text-brand-secondary focus:outline-none focus:border-brand-neon/50 transition-all resize-none"
                />
             </div>

             <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Excerpt (Brief Summary)</label>
                <textarea 
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs text-brand-secondary focus:outline-none focus:border-brand-neon/50 transition-all resize-none"
                />
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
