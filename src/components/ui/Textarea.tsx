import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, variant = 'default', size = 'md', ...props }, ref) => {
    const textareaClasses = cn(
      'w-full rounded-lg border bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-transparent transition-all duration-200 resize-vertical',
      {
        'border-gray-600': variant === 'default',
        'border-red-500 focus:ring-red-500/50': variant === 'error',
        'border-green-500 focus:ring-green-500/50': variant === 'success',
        'px-2 py-1 text-xs min-h-[60px]': size === 'sm',
        'px-4 py-3 text-base min-h-[120px]': size === 'lg',
        'min-h-[80px]': size === 'md',
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
        <textarea
          className={textareaClasses}
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

Textarea.displayName = 'Textarea';

export default Textarea; 