import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, variant = 'default', size = 'md', options, onChange, ...props }, ref) => {
    const selectClasses = cn(
      'w-full rounded-lg border bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer',
      {
        'border-gray-600': variant === 'default',
        'border-red-500 focus:ring-red-500/50': variant === 'error',
        'border-green-500 focus:ring-green-500/50': variant === 'success',
        'px-2 py-1 text-xs': size === 'sm',
        'px-4 py-3 text-base': size === 'lg',
      },
      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={selectClasses}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-gray-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select';

export default Select; 