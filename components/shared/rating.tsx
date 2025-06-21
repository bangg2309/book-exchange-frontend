import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  size = 'medium',
  readonly = false,
  className,
}: RatingProps) {
  const stars = [1, 2, 3, 4, 5];
  
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-7 w-7',
  };
  
  const handleClick = (rating: number) => {
    if (readonly) return;
    onChange?.(rating);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={cn(
            'text-yellow-400 hover:text-yellow-500 transition-colors',
            readonly && 'cursor-default',
            !readonly && 'cursor-pointer'
          )}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'fill-current',
              value >= star ? 'opacity-100' : 'opacity-30'
            )}
          />
        </button>
      ))}
    </div>
  );
} 