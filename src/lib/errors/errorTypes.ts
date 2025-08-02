// Custom error classes for the application

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode?: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    const code = field ? `VALIDATION_ERROR_${field.toUpperCase()}` : 'VALIDATION_ERROR';
    super(message, code, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class PermissionError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'PERMISSION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
  }
}

export class AIError extends AppError {
  constructor(message = 'AI service error') {
    super(message, 'AI_ERROR', 500);
  }
}

// Error codes enum for consistent error handling
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AI_ERROR = 'AI_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
} 