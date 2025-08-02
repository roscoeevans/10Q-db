import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler, createErrorBoundary } from './errorHandlers';
import { AppError } from './errorTypes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    errorHandler.handle(error);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  const appError = error ? createErrorBoundary(error) : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-4">
            {appError?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          {appError?.code && (
            <p className="text-xs text-gray-500 mb-4">
              Error Code: {appError.code}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          {resetError && (
            <button
              onClick={resetError}
              className="w-full bg-ios-blue text-white px-4 py-2 rounded-lg hover:bg-ios-blue/90 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for using error boundaries in functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    errorHandler.handle(error);
  }, []);

  return {
    error,
    resetError,
    handleError,
  };
}; 