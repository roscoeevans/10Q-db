import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  DatabaseError,
  NetworkError,
  AIError,
  ErrorCodes
} from '../errorTypes';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create base error with default values', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBeUndefined();
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 418);
      
      expect(error.statusCode).toBe(418);
    });

    it('should create non-operational error', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 500, false);
      
      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error without field', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid email', 'email');
      
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('VALIDATION_ERROR_EMAIL');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Custom auth message');
      
      expect(error.message).toBe('Custom auth message');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('PermissionError', () => {
    it('should create permission error with default message', () => {
      const error = new PermissionError();
      
      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('PERMISSION_ERROR');
      expect(error.statusCode).toBe(403);
    });

    it('should create permission error with custom message', () => {
      const error = new PermissionError('Custom permission message');
      
      expect(error.message).toBe('Custom permission message');
      expect(error.code).toBe('PERMISSION_ERROR');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default resource', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
    });

    it('should create not found error with custom resource', () => {
      const error = new NotFoundError('User');
      
      expect(error.message).toBe('User not found');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with default message', () => {
      const error = new DatabaseError();
      
      expect(error.message).toBe('Database operation failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should create database error with custom message', () => {
      const error = new DatabaseError('Connection timeout');
      
      expect(error.message).toBe('Connection timeout');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with default message', () => {
      const error = new NetworkError();
      
      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(0);
    });

    it('should create network error with custom message', () => {
      const error = new NetworkError('Request timeout');
      
      expect(error.message).toBe('Request timeout');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(0);
    });
  });

  describe('AIError', () => {
    it('should create AI error with default message', () => {
      const error = new AIError();
      
      expect(error.message).toBe('AI service error');
      expect(error.code).toBe('AI_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should create AI error with custom message', () => {
      const error = new AIError('Model not available');
      
      expect(error.message).toBe('Model not available');
      expect(error.code).toBe('AI_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ErrorCodes enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
      expect(ErrorCodes.PERMISSION_ERROR).toBe('PERMISSION_ERROR');
      expect(ErrorCodes.NOT_FOUND_ERROR).toBe('NOT_FOUND_ERROR');
      expect(ErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCodes.AI_ERROR).toBe('AI_ERROR');
      expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Error inheritance', () => {
    it('should properly inherit from Error', () => {
      const errors = [
        new ValidationError('test'),
        new AuthenticationError(),
        new PermissionError(),
        new NotFoundError(),
        new DatabaseError(),
        new NetworkError(),
        new AIError()
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      });
    });

    it('should have unique error codes', () => {
      const errorCodes = [
        new ValidationError('test').code,
        new AuthenticationError().code,
        new PermissionError().code,
        new NotFoundError().code,
        new DatabaseError().code,
        new NetworkError().code,
        new AIError().code
      ];

      const uniqueCodes = new Set(errorCodes);
      expect(uniqueCodes.size).toBe(errorCodes.length);
    });
  });
}); 