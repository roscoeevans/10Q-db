import React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'white';
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', label = 'Loading...', ...props }, ref) => {
    const spinnerClasses = cn(
      'animate-spin rounded-full border-2 border-transparent',
      {
        // Variants
        'border-ios-blue': variant === 'primary',
        'border-white': variant === 'white',
        'border-gray-300': variant === 'default',
        
        // Sizes
        'w-4 h-4 border-t-2': size === 'sm',
        'w-6 h-6 border-t-2': size === 'md',
        'w-8 h-8 border-t-2': size === 'lg',
        'w-12 h-12 border-t-3': size === 'xl',
      },
      className
    );

    return (
      <div className="flex flex-col items-center justify-center space-y-2" ref={ref} {...props}>
        <div className={spinnerClasses} />
        {label && (
          <span className="text-sm text-gray-400">{label}</span>
        )}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner; 