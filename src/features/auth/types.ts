import type { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  permissionLoading: boolean;
  userRole?: string;
}

export interface AuthService {
  getAuthState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  refreshPermission(): Promise<void>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
} 