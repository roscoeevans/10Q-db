import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, variant = 'default', size = 'md', ...props }, ref) => {
    const inputClasses = cn(
      'w-full rounded-lg border bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-transparent transition-all duration-200',
      {
        'border-gray-600': variant === 'default',
        'border-red-500 focus:ring-red-500/50': variant === 'error',
        'border-green-500 focus:ring-green-500/50': variant === 'success',
        'px-2 py-1 text-xs': size === 'sm',
        'px-4 py-3 text-base': size === 'lg',
      },
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          className={inputClasses}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-400' : 'text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 