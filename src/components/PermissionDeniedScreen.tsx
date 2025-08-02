import { LogOut, AlertTriangle, User, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PermissionDeniedScreen() {
  const { user, userRole, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 to-ios-gray-100 dark:from-ios-gray-950 dark:to-ios-gray-900 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-ios-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-ios-red" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-ios-gray-900 dark:text-ios-gray-100 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg">
            <User className="w-5 h-5 text-ios-gray-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-ios-gray-900 dark:text-ios-gray-100">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">
                {user?.email}
              </p>
              {userRole && (
                <p className="text-xs text-ios-blue">
                  Role: {userRole}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-ios-gray-600 dark:text-ios-gray-400">
            You don't have permission to use this app.
          </p>
          
          <div className="bg-ios-yellow/10 border border-ios-yellow/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-ios-yellow mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-ios-yellow mb-1">
                  Admin Access Required
                </p>
                <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">
                  Please contact Roscoe if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={signOut}
            className="ios-button w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          
          <p className="text-xs text-ios-gray-500 dark:text-ios-gray-500">
            Project: q-production-e4848
          </p>
        </div>
      </div>
    </div>
  );
} 