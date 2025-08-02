import React from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, variant = 'default', size = 'md', onChange, ...props }, ref) => {
    const checkboxClasses = cn(
      'rounded border bg-white/10 backdrop-blur-sm text-ios-blue focus:ring-2 focus:ring-ios-blue/50 focus:ring-offset-0 transition-all duration-200',
      {
        'border-gray-600': variant === 'default',
        'border-red-500 focus:ring-red-500/50': variant === 'error',
        'border-green-500 focus:ring-green-500/50': variant === 'success',
        'w-3 h-3': size === 'sm',
        'w-4 h-4': size === 'md',
        'w-5 h-5': size === 'lg',
      },
      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className={checkboxClasses}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-white cursor-pointer">
              {label}
            </label>
          )}
        </div>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox; 