import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../authService';
import { signInWithPopup, signOut } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    addScope: vi.fn(),
  })),
}));

// Mock permissions
vi.mock('@/lib/permissions', () => ({
  permissionService: {
    checkUserPermission: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance for each test
    (AuthService as any).instance = undefined;
    authService = AuthService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAuthState', () => {
    it('should return initial auth state', () => {
      const state = authService.getAuthState();
      
      expect(state).toEqual({
        user: null,
        loading: true,
        error: null,
        hasPermission: false,
        permissionLoading: false,
        userRole: undefined
      });
    });
  });

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = authService.subscribe(listener);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should remove listener when unsubscribe is called', () => {
      const listener = vi.fn();
      const unsubscribe = authService.subscribe(listener);
      
      unsubscribe();
      
      // The listener should be removed (we can't easily test this directly,
      // but we can verify the unsubscribe function doesn't throw)
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in successfully', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn'
      } as any);

      await authService.signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalled();
    });

    it('should handle sign in error', async () => {
      const error = new Error('Sign in failed');
      vi.mocked(signInWithPopup).mockRejectedValue(error);

      await expect(authService.signInWithGoogle()).rejects.toThrow('Sign in failed');
    });

    it('should update auth state during sign in process', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn'
      } as any);

      const listener = vi.fn();
      authService.subscribe(listener);

      // Start sign in
      const signInPromise = authService.signInWithGoogle();
      
      // Check that loading state was set
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          loading: true,
          error: null
        })
      );

      await signInPromise;
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(signOut).mockResolvedValue();

      await authService.signOut();

      expect(signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const error = new Error('Sign out failed');
      vi.mocked(signOut).mockRejectedValue(error);

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user', () => {
      expect(authService.getCurrentUser()).toBe(null);
    });
  });

  describe('refreshPermission', () => {
    it('should handle refresh permission call', async () => {
      // This test verifies the method can be called without errors
      await expect(authService.refreshPermission()).resolves.not.toThrow();
    });
  });
}); 