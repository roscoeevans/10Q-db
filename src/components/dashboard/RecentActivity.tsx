import React from 'react';
import { Card } from '../ui';
import { Badge } from '../ui';

export interface ActivityItem {
  id: string;
  type: 'upload' | 'edit' | 'delete';
  description: string;
  timestamp: string;
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 5,
  className,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'edit':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActivityBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return 'success' as const;
      case 'edit':
        return 'primary' as const;
      case 'delete':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{activity.description}</p>
                    <Badge variant={getActivityBadgeVariant(activity.type)} size="sm">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button className="text-sm text-ios-blue hover:text-ios-blue/80 transition-colors">
              View all activity
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity; 