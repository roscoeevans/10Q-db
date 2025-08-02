import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { AuthState } from '../types';

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  refreshPermission: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signOut: authService.signOut.bind(authService),
    refreshPermission: authService.refreshPermission.bind(authService)
  };
} 