import { signInWithPopup, signOut, type User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { permissionService, type PermissionCheck } from './permissions';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  permissionLoading: boolean;
  userRole?: string;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    loading: true,
    error: null,
    hasPermission: false,
    permissionLoading: false,
    userRole: undefined
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.authState = {
        ...this.authState,
        user,
        loading: false,
        error: null
      };
      
      // Check permissions if user is authenticated
      if (user) {
        await this.checkUserPermission(user);
      } else {
        this.authState = {
          ...this.authState,
          hasPermission: false,
          permissionLoading: false,
          userRole: undefined
        };
      }
      
      this.notifyListeners();
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.authState = { ...this.authState, loading: true, error: null };
      this.notifyListeners();

      const result = await signInWithPopup(auth, googleProvider);
      console.log('Successfully signed in:', result.user.email);
      
      // The onAuthStateChanged listener will handle updating the state
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      this.authState = {
        ...this.authState,
        loading: false,
        error: errorMessage
      };
      this.notifyListeners();
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.authState.user;
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  private async checkUserPermission(user: User): Promise<void> {
    this.authState = {
      ...this.authState,
      permissionLoading: true
    };
    this.notifyListeners();

    try {
      const permissionCheck: PermissionCheck = await permissionService.checkUserPermission(user);
      
      this.authState = {
        ...this.authState,
        hasPermission: permissionCheck.hasPermission,
        permissionLoading: false,
        userRole: permissionCheck.role
      };
      
      console.log(`Permission check for ${user.email}: ${permissionCheck.hasPermission ? 'GRANTED' : 'DENIED'}${permissionCheck.role ? ` (Role: ${permissionCheck.role})` : ''}`);
    } catch (error) {
      console.error('Error checking user permission:', error);
      this.authState = {
        ...this.authState,
        hasPermission: false,
        permissionLoading: false,
        userRole: undefined
      };
    }
    
    this.notifyListeners();
  }

  async refreshPermission(): Promise<void> {
    if (this.authState.user) {
      await this.checkUserPermission(this.authState.user);
    }
  }
}

export const authService = AuthService.getInstance();