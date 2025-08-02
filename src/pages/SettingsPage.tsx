import { Settings, User, LogOut, Shield, Database, Info } from 'lucide-react';
import type { User as UserType } from '../types/common';

interface SettingsPageProps {
  user: UserType | null;
  onSignOut: () => Promise<void>;
}

const SettingsPage = ({ user, onSignOut }: SettingsPageProps) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-ios-blue" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </h3>
            <div className="bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                  <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Permissions
            </h3>
            <div className="bg-ios-green/10 border border-ios-green/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-ios-green" />
                <span className="font-medium text-ios-green">Admin Access</span>
              </div>
              <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400 mt-1">
                You have full access to create and manage questions.
              </p>
            </div>
          </div>

          {/* Database Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Information
            </h3>
            <div className="bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Project ID</span>
                  <span className="text-sm font-medium">q-production-e4848</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Environment</span>
                  <span className="text-sm font-medium">Production</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5" />
              About
            </h3>
            <div className="bg-ios-gray-50 dark:bg-ios-gray-800 rounded-lg p-4">
              <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">
                10Q Database is a modern question management tool for creating and organizing daily quiz sets with AI-powered generation.
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-ios-gray-200 dark:border-ios-gray-700">
            <button
              onClick={onSignOut}
              className="ios-button-secondary w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 