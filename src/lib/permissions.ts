import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export interface PermissionCheck {
  hasPermission: boolean;
  role?: string;
  grantedAt?: string;
}

export class PermissionService {
  private static instance: PermissionService;
  private cache: Map<string, { permission: PermissionCheck; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  async checkUserPermission(user: User): Promise<PermissionCheck> {
    const email = user.email;
    if (!email) {
      return { hasPermission: false };
    }

    // Check cache first
    const cached = this.cache.get(email);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.permission;
    }

    try {
      // 🔑 Step 3: Admin Claim Check
      // Check for the custom claim admin: true on the user's token
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      if (isAdmin) {
        const permission: PermissionCheck = {
          hasPermission: true,
          role: 'admin',
          grantedAt: new Date().toISOString()
        };

        // Cache the result
        this.cache.set(email, {
          permission,
          timestamp: Date.now()
        });

        console.log(`✅ Admin access granted for ${email} via custom claim`);
        return permission;
      }

      // If no admin claim, check Firestore as fallback (for backward compatibility)
      const adminDocRef = doc(db, 'admin_users', email);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const permission: PermissionCheck = {
          hasPermission: true,
          role: adminData.role || 'admin',
          grantedAt: adminData.grantedAt
        };

        // Cache the result
        this.cache.set(email, {
          permission,
          timestamp: Date.now()
        });

        console.log(`✅ Admin access granted for ${email} via Firestore (fallback)`);
        return permission;
      }

      // Fallback to hardcoded list for backward compatibility
      const authorizedEmails = [
        'roscoeevans@gmail.com',
        'admin@10q.com',
        // Add more authorized emails here
      ];

      const hasPermission = authorizedEmails.includes(email);
      const permission: PermissionCheck = { 
        hasPermission,
        role: hasPermission ? 'admin' : undefined
      };

      // Cache the result
      this.cache.set(email, {
        permission,
        timestamp: Date.now()
      });

      if (hasPermission) {
        console.log(`✅ Admin access granted for ${email} via hardcoded list (fallback)`);
      } else {
        console.log(`❌ Admin access denied for ${email} - no admin claim found`);
      }

      return permission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      
      // On error, fall back to hardcoded list
      const authorizedEmails = [
        'roscoeevans@gmail.com',
        'admin@10q.com',
      ];
      
      const hasPermission = authorizedEmails.includes(email);
      return { 
        hasPermission,
        role: hasPermission ? 'admin' : undefined
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearUserCache(email: string): void {
    this.cache.delete(email);
  }
}

export const permissionService = PermissionService.getInstance(); 