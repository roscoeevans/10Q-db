import { AppError, ErrorCodes } from './errorTypes';

// Error handler interface
export interface ErrorHandler {
  handle(error: Error | AppError): void;
  log(error: Error | AppError): void;
  report(error: Error | AppError): void;
}

// Default error handler implementation
export class DefaultErrorHandler implements ErrorHandler {
  handle(error: Error | AppError): void {
    this.log(error);
    
    // Handle operational errors differently from programming errors
    if (error instanceof AppError && error.isOperational) {
      this.handleOperationalError(error);
    } else {
      this.handleProgrammingError(error);
    }
  }

  log(error: Error | AppError): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      }),
    };

    console.error('Error logged:', errorInfo);
  }

  report(error: Error | AppError): void {
    // In a real application, this would send errors to an error reporting service
    // like Sentry, LogRocket, or similar
    console.warn('Error reporting not implemented:', error);
  }

  private handleOperationalError(error: AppError): void {
    // Operational errors are expected and can be handled gracefully
    console.warn('Operational error handled:', error.message);
  }

  private handleProgrammingError(error: Error): void {
    // Programming errors should be reported and may require immediate attention
    console.error('Programming error detected:', error);
    this.report(error);
  }
}

// Error handler instance
export const errorHandler = new DefaultErrorHandler();

// Utility functions for common error handling patterns
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    errorHandler.handle(error as Error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
};

export const createErrorBoundary = (error: Error | AppError): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Convert unknown errors to AppError
  return new AppError(
    error.message || 'An unknown error occurred',
    ErrorCodes.UNKNOWN_ERROR,
    500,
    false
  );
};

export const isOperationalError = (error: Error | AppError): boolean => {
  return error instanceof AppError && error.isOperational;
};

export const getErrorMessage = (error: Error | AppError): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  // For unknown errors, provide a user-friendly message
  return 'Something went wrong. Please try again.';
};

export const getErrorCode = (error: Error | AppError): string => {
  if (error instanceof AppError) {
    return error.code;
  }
  return ErrorCodes.UNKNOWN_ERROR;
}; 