import { useState } from 'react';
import { Trash2, Upload, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { cleanImageUrl } from '../../utils/urlHelper';
import { useNotification } from '../../context/NotificationContext';

interface ImageGalleryManagerProps {
  propertyId: string;
  images: { id: string; url: string }[];
  onUpdate: () => void;
}

const ImageGalleryManager = ({ propertyId, images, onUpdate }: ImageGalleryManagerProps) => {
  const { user } = useAuth();
  const { showNotification, confirm } = useNotification();
  const [loading, setLoading] = useState<string | null>(null); // imageId or 'upload'
  const isCP = user?.role === 'CP' || user?.role === 'Channel Partner';

  const handleDelete = async (imageId: string) => {
    const confirmed = await confirm({
      message: 'Permanent purge: Delete this visual asset?',
      type: 'danger'
    });
    if (!confirmed) return;
    
    setLoading(imageId);
    try {
      const endpoint = isCP ? `/cp/properties/images/${imageId}` : `/admin/properties/images/${imageId}`;
      await apiClient.delete(endpoint);
      onUpdate();
    } catch (err) {
      showNotification('error', 'Failed to delete visual asset');
    } finally {
      setLoading(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading('upload');
    
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append('images', file));

    try {
      const endpoint = isCP ? `/cp/properties/${propertyId}/images` : `/admin/properties/${propertyId}/images`;
      await apiClient.post(endpoint, formData);
      onUpdate();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Asset upload failed';
      showNotification('error', msg);
    } finally {
      setLoading(null);
    }
  };

  const handleReplace = async (imageId: string, file: File) => {
    setLoading(imageId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const endpoint = isCP ? `/cp/properties/images/${imageId}` : `/admin/properties/images/${imageId}`;
      await apiClient.put(endpoint, formData);
      onUpdate();
    } catch (err) {
      showNotification('error', 'Asset replacement failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-brand-neon uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 bg-brand-neon rounded-full shadow-glow" />
            Visual Assets
          </h3>
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest opacity-40 ml-5">Managed Gallery Grid</p>
        </div>
        <label className={`flex items-center gap-3 px-6 py-3.5 bg-brand-neon/10 hover:bg-brand-neon text-brand-neon hover:text-white rounded-2xl cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest border border-brand-neon/20 hover:shadow-glow ${loading === 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {loading === 'upload' ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
          Add Modules
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={!!loading} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <div key={img.id || index} className="aspect-square rounded-2xl border border-white/10 overflow-hidden relative group shadow-lg bg-brand-deep/30">
            <img 
              src={cleanImageUrl(img.url)} 
              alt={`Asset ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Asset+Missing';
              }}
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <label className="p-2.5 bg-white/10 hover:bg-brand-neon hover:text-white rounded-xl text-brand-secondary cursor-pointer transition-all border border-white/5 hover:border-brand-neon/20 hover:shadow-glow">
                <RefreshCw size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplace(img.id, e.target.files[0])} disabled={!!loading} />
              </label>
              <button 
                onClick={() => handleDelete(img.id)}
                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 hover:shadow-glow"
              >
                {loading === img.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
              </button>
            </div>

            {loading === img.id && (
              <div className="absolute inset-0 bg-brand-bg/40 backdrop-blur-md flex items-center justify-center z-20">
                <Loader2 className="animate-spin text-brand-neon shadow-glow" size={28} />
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="py-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-brand-secondary group hover:border-brand-neon/20 transition-all bg-white/5">
           <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-neon/10 transition-all duration-500">
             <ImageIcon size={32} className="opacity-20 group-hover:opacity-100 group-hover:text-brand-neon transition-all" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">No visual modules detected in buffer.</p>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
