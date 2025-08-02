import { Search, Settings, Home, Upload } from 'lucide-react';
import { cn } from '../../lib/utils/common';
import type { Tab } from '../../types/common';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
    { id: 'explore' as Tab, label: 'Explore', icon: Search },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="glass-card p-2 mb-6">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105",
                activeTab === tab.id
                  ? "bg-ios-blue text-white shadow-md"
                  : "text-ios-gray-600 dark:text-ios-gray-400 hover:text-ios-gray-900 dark:hover:text-ios-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation; 