# 10QDB Permission System

## Overview

The 10QDB (10Q Database) tool implements a comprehensive permission system to ensure only authorized administrators can access and modify the question database. This system provides multiple layers of security and flexibility for managing user access.

## Authentication Flow

1. **User Signs In**: User authenticates with Google OAuth
2. **Permission Check**: System checks if the user has admin permissions
3. **Access Granted/Denied**: User either gets access to the tool or sees a permission denied screen

## Permission Levels

### Current Implementation

The system supports two permission sources:

1. **Firestore Collection** (`admin_users`): Primary source for managing permissions
2. **Hardcoded Fallback**: Backup list for critical admin accounts

### User Roles

- **admin**: Standard administrator access
- **super-admin**: Enhanced administrator access (future use)
- **viewer**: Read-only access (future use)

## Permission Sources

### 1. Firestore Collection (`admin_users`)

The primary permission system uses a Firestore collection with the following structure:

```typescript
interface AdminUser {
  email: string;           // User's email address (document ID)
  role: string;           // User role (admin, super-admin, etc.)
  grantedAt: string;      // ISO timestamp when access was granted
  grantedBy: string;      // Who granted the access
}
```

### 2. Hardcoded Fallback

For critical admin accounts and backward compatibility:

```typescript
const authorizedEmails = [
  'roscoeevans@gmail.com',
  'admin@10q.com',
  // Add more authorized emails here
];
```

## Managing Admin Users

### Using the Management Script

A Node.js script is provided to manage admin users:

```bash
# Add a new admin user
node scripts/manage-admin-users.js add user@example.com

# Add with specific role
node scripts/manage-admin-users.js add user@example.com super-admin

# Remove an admin user
node scripts/manage-admin-users.js remove user@example.com

# Check if a user is an admin
node scripts/manage-admin-users.js check user@example.com

# List all admin users
node scripts/manage-admin-users.js list

# Show help
node scripts/manage-admin-users.js help
```

### Manual Firestore Management

You can also manage admin users directly in the Firebase Console:

1. Go to Firestore Database
2. Navigate to the `admin_users` collection
3. Add/remove documents with email addresses as document IDs

## Security Features

### 1. Permission Caching

- Permissions are cached for 5 minutes to reduce Firestore reads
- Cache is automatically invalidated when permissions change
- Fallback to hardcoded list if Firestore is unavailable

### 2. Error Handling

- Graceful fallback to hardcoded list on network errors
- Clear error messages for debugging
- No sensitive information exposed in error messages

### 3. User Experience

- Clear permission denied screen with user information
- Loading states during permission checks
- Smooth transitions between authentication states

## Implementation Details

### Auth Service (`src/lib/auth.ts`)

The auth service now includes permission checking:

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  permissionLoading: boolean;
  userRole?: string;
}
```

### Permission Service (`src/lib/permissions.ts`)

Dedicated service for permission management:

```typescript
class PermissionService {
  async checkUserPermission(user: User): Promise<PermissionCheck>
  clearCache(): void
  clearUserCache(email: string): void
}
```

### Components

- **PermissionDeniedScreen**: Shows when user lacks permissions
- **LoginScreen**: Handles initial authentication
- **App**: Orchestrates the authentication flow

## Adding New Admin Users

### Method 1: Using the Script (Recommended)

```bash
node scripts/manage-admin-users.js add newadmin@example.com
```

### Method 2: Firebase Console

1. Open Firebase Console
2. Navigate to Firestore Database
3. Go to `admin_users` collection
4. Add a new document with:
   - Document ID: `newadmin@example.com`
   - Fields:
     - `email`: `newadmin@example.com`
     - `role`: `admin`
     - `grantedAt`: Current timestamp
     - `grantedBy`: Your identifier

### Method 3: Hardcoded Fallback

Add to the `authorizedEmails` array in `src/lib/permissions.ts`:

```typescript
const authorizedEmails = [
  'roscoeevans@gmail.com',
  'admin@10q.com',
  'newadmin@example.com', // Add here
];
```

## Testing the Permission System

### Test Cases

1. **Unauthorized User**:
   - Sign in with a non-admin Google account
   - Should see permission denied screen
   - Should be able to sign out

2. **Authorized User**:
   - Sign in with an admin Google account
   - Should see the main 10QDB interface
   - Should have full access to all features

3. **Network Issues**:
   - Disconnect from internet
   - Should fall back to hardcoded list
   - Should still work for hardcoded users

### Debugging

Check the browser console for permission check logs:

```
Permission check for user@example.com: GRANTED (Role: admin)
Permission check for unauthorized@example.com: DENIED
```

## Future Enhancements

### Planned Features

1. **Role-Based Permissions**: Different access levels for different roles
2. **Permission Expiration**: Time-limited admin access
3. **Audit Logging**: Track permission changes and usage
4. **Bulk Management**: Add/remove multiple users at once
5. **Email Notifications**: Notify when permissions are granted/revoked

### Security Improvements

1. **Custom Claims**: Use Firebase Auth custom claims for permissions
2. **IP Restrictions**: Limit access to specific IP ranges
3. **Two-Factor Authentication**: Require 2FA for admin access
4. **Session Management**: Track and manage active sessions

## Troubleshooting

### Common Issues

1. **Permission Check Fails**:
   - Check Firestore rules allow reading `admin_users` collection
   - Verify user is authenticated before permission check
   - Check network connectivity

2. **Cache Issues**:
   - Clear browser cache
   - Wait 5 minutes for cache to expire
   - Use `refreshPermission()` method

3. **Script Errors**:
   - Ensure Firebase Admin SDK is properly configured
   - Check Firestore rules allow write access to `admin_users`
   - Verify email format is correct

### Firestore Rules

Ensure your Firestore rules allow access to the `admin_users` collection:

```javascript
match /admin_users/{email} {
  allow read: if request.auth != null && request.auth.token.email == email;
  allow write: if request.auth != null && 
    request.auth.token.email in ['roscoeevans@gmail.com', 'admin@10q.com'];
}
```

## Support

For issues with the permission system:

1. Check the browser console for error messages
2. Verify Firestore connectivity
3. Test with the management script
4. Review Firestore rules
5. Contact the development team

---

**Note**: This permission system is designed for internal use and should not be used for public-facing applications without additional security measures. 