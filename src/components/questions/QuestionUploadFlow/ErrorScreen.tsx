import { AlertCircle, Upload, RefreshCw } from 'lucide-react';
import type { ErrorScreenProps } from './types';

const ErrorScreen = ({ 
  error,
  onRetry,
  onGenerateAnother
}: ErrorScreenProps) => (
  <div className="glass-card p-6 max-w-md mx-auto text-center">
    <AlertCircle className="w-16 h-16 text-ios-red mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-4 text-ios-red">Upload Failed</h2>
    <div className="bg-ios-red/10 border border-ios-red/20 rounded-lg p-4 mb-6">
      <p className="text-ios-red text-sm">{error}</p>
    </div>
    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="ios-button w-full flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Try Again
      </button>
      <button
        onClick={onGenerateAnother}
        className="ios-button-secondary w-full flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Start Over
      </button>
    </div>
  </div>
);

export default ErrorScreen; 