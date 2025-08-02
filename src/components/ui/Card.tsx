import { cn } from '../../lib/utils/common';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-ios-gray-800 border border-ios-gray-200 dark:border-ios-gray-700',
      glass: 'glass-card'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl shadow-sm',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card; 