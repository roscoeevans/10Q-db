// Authentication-related type definitions

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  hasPermission: boolean;
  permissionLoading: boolean;
  signOut: () => Promise<void>;
} 