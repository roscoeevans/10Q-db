// Common types used across the application

export type Tab = 'home' | 'upload' | 'explore' | 'settings';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  hasPermission: boolean;
  permissionLoading: boolean;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
} 