import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const [_, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        end = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-16 mb-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 rounded-2xl text-brand-secondary bg-white/5 border border-white/5 hover:border-brand-neon/50 hover:text-brand-neon disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 p-1.5 rounded-3xl bg-white/5 border border-white/5">
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`w-11 h-11 rounded-2xl text-sm font-black tracking-tighter transition-all duration-300 ${
              currentPage === pageNum
                ? 'bg-brand-neon text-white shadow-glow scale-110'
                : 'text-brand-secondary hover:bg-white/10 hover:text-white'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-3 rounded-2xl text-brand-secondary bg-white/5 border border-white/5 hover:border-brand-neon/50 hover:text-brand-neon disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
