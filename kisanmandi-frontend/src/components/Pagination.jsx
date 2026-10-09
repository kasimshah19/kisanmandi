import { ChevronLeft, ChevronRight } from 'lucide-react';

// Pagination with Prev/Next and page numbers, hides when only 1 page
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Show at most 5 page numbers centered around current
  const pages = [];
  let start = Math.max(0, page - 2);
  let end = Math.min(totalPages - 1, page + 2);
  if (end - start < 4) {
    if (start === 0) end = Math.min(totalPages - 1, start + 4);
    else start = Math.max(0, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition
            ${p === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
