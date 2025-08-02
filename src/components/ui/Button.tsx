import { cn } from '../../lib/utils/common';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-ios-blue text-white hover:bg-ios-blue/90',
      secondary: 'bg-ios-gray-100 text-ios-gray-900 hover:bg-ios-gray-200 dark:bg-ios-gray-700 dark:text-ios-gray-100 dark:hover:bg-ios-gray-600',
      outline: 'border border-ios-gray-300 bg-transparent hover:bg-ios-gray-50 dark:border-ios-gray-600 dark:hover:bg-ios-gray-800',
      ghost: 'hover:bg-ios-gray-100 hover:text-ios-gray-900 dark:hover:bg-ios-gray-800 dark:hover:text-ios-gray-100',
      destructive: 'bg-red-500 text-white hover:bg-red-500/90'
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg'
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 