import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ value = 0, onChange, size = 20, readOnly = true }) {
  const stars = [];
  const handleKeyDown = (e, i) => {
    if (!readOnly && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(i + 1);
    }
  };

  for (let i = 0; i < 5; i++) {
    const isFull = value >= i + 1;
    const isHalf = value > i && value < i + 1;
    
    stars.push(
      <button
        key={i}
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && onChange && onChange(i + 1)}
        onKeyDown={(e) => handleKeyDown(e, i)}
        aria-label={`Rate ${i + 1} stars`}
        className={`transition-transform focus:outline-none focus:ring-2 focus:ring-green-500 rounded ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        style={{ width: size, height: size, color: '#f59e0b' }}
      >
        {isFull ? (
          <Star size={size} fill="currentColor" strokeWidth={1} />
        ) : isHalf ? (
          <StarHalf size={size} fill="currentColor" strokeWidth={1} />
        ) : (
          <Star size={size} fill="none" strokeWidth={1} />
        )}
      </button>
    );
  }
  return <div className="flex gap-1 items-center">{stars}</div>;
}
