import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cleanImageUrl } from '../../utils/urlHelper';

interface ImageGalleryProps {
  images: { id: string; url: string }[];
  title: string;
  isFeatured?: boolean;
  tier?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, isFeatured, tier }) => {
  const [activeImage, setActiveImage] = useState(images[0]?.url);

  if (!images || images.length === 0) return (
    <div className="aspect-[16/9] md:aspect-[21/9] bg-white/5 flex items-center justify-center rounded-[2.5rem]">
       <Sparkles className="w-12 h-12 text-brand-neon opacity-20" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Primary Image */}
      <div className="rounded-[2.5rem] overflow-hidden shadow-glow-lg aspect-[16/9] md:aspect-[21/9] relative group bg-brand-deep">
        <img
          src={cleanImageUrl(activeImage || images[0]?.url)}
          alt={`${title} - Primary Asset`}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-8 left-8 flex flex-col gap-3">
          {(isFeatured || tier === 'PREMIUM' || tier === 'PRO') && (
            <span className="bg-brand-neon text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-glow uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse-glow">
              <Sparkles size={14} />
              Premium Asset
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.url)}
              className={`relative w-24 h-24 md:w-36 md:h-36 flex-shrink-0 rounded-[1.5rem] overflow-hidden transition-all duration-500 ${
                activeImage === img.url ? 'ring-2 ring-brand-neon ring-offset-4 ring-offset-brand-bg opacity-100 scale-95 shadow-glow' : 'opacity-40 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={cleanImageUrl(img.url)} alt={`Asset View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

