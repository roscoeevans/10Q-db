import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const badgeClasses = cn(
      'inline-flex items-center rounded-full font-medium',
      {
        // Variants
        'bg-gray-100 text-gray-800': variant === 'default',
        'bg-ios-blue text-white': variant === 'primary',
        'bg-gray-600 text-white': variant === 'secondary',
        'bg-green-100 text-green-800': variant === 'success',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-red-100 text-red-800': variant === 'error',
        'bg-blue-100 text-blue-800': variant === 'info',
        
        // Sizes
        'px-2 py-0.5 text-xs': size === 'sm',
        'px-2.5 py-0.5 text-sm': size === 'md',
        'px-3 py-1 text-base': size === 'lg',
      },
      className
    );

    return (
      <span
        className={badgeClasses}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge; 