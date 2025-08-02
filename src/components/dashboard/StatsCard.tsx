import React from 'react';
import { Card } from '../ui';
import { cn } from '../../lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  const cardClasses = cn(
    'p-6 transition-all duration-200 hover:scale-105',
    {
      'border-l-4 border-ios-blue': variant === 'primary',
      'border-l-4 border-green-500': variant === 'success',
      'border-l-4 border-yellow-500': variant === 'warning',
      'border-l-4 border-red-500': variant === 'error',
    },
    className
  );

  const trendClasses = cn(
    'flex items-center text-sm font-medium',
    {
      'text-green-600': trend?.isPositive,
      'text-red-600': trend && !trend.isPositive,
    }
  );

  return (
    <Card className={cardClasses}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={trendClasses}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-ios-blue/10 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard; 