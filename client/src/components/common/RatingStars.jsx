import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5, size = 'md', interactive = false, onSelect }) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            onClick={() => interactive && onSelect && onSelect(star)}
            className={`${sizeMap[size]} ${
              isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            } ${interactive ? 'cursor-pointer transition-transform hover:scale-125' : ''}`}
          />
        );
      })}
    </div>
  );
};
