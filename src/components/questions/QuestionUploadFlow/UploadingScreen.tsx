import { Upload, Loader2 } from 'lucide-react';
import type { UploadingScreenProps } from './types';

const UploadingScreen = ({ targetDate, theme }: UploadingScreenProps) => (
  <div className="glass-card p-6 max-w-md mx-auto text-center">
    <div className="animate-pulse">
      <Upload className="w-16 h-16 text-ios-blue mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Uploading Your Quiz</h2>
      <div className="space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-ios-blue mx-auto" />
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Uploading "{theme}" quiz for {targetDate}...
        </p>
        <div className="space-y-2">
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse"></div>
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          <div className="h-2 bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-xs text-ios-gray-500">
          Please don't close this page...
        </p>
      </div>
    </div>
  </div>
);

export default UploadingScreen; 