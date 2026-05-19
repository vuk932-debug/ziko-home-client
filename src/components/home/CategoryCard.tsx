import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  title: string;
  description: string;
  categoryParam: string;
  Icon: LucideIcon;
  gradient: string;
  iconColor: string;
  badge?: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const navigate = useNavigate();
  const { title, description, categoryParam, Icon, gradient, iconColor, badge } = category;

  const handleClick = () => {
    navigate(`/properties?category=${categoryParam}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Browse ${title} properties`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="
        group relative glass-card rounded-2xl p-8
        border-white/5 hover:border-brand-neon/40
        transition-all duration-500 ease-out
        hover:-translate-y-2 cursor-pointer
        focus:outline-none overflow-hidden
      "
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full filter blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${gradient}`} />

      {/* Badge */}
      {badge && (
        <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg bg-brand-neon text-white shadow-glow animate-pulse">
          {badge}
        </span>
      )}

      {/* Icon Wrapper */}
      <div
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-8
          ${gradient}
          shadow-glow group-hover:shadow-glow-lg transition-all duration-500 group-hover:rotate-6
        `}
      >
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-brand-neon transition-colors">
          {title}
        </h3>
        <p className="text-sm text-brand-secondary leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
      </div>

      {/* Futuristic Action Indicator */}
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-brand-neon">
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Range</span>
        <div className="w-8 h-[2px] bg-brand-neon/30 group-hover:w-12 group-hover:bg-brand-neon transition-all duration-500" />
      </div>
    </article>
  );
};

export default CategoryCard;
