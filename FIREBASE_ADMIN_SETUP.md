# 🔐 Firebase Admin Setup Guide for 10Q-DB

This guide explains how to set up Firebase Admin SDK and manage admin users for the 10Q-DB application.

## 📋 Prerequisites

- Firebase project: `q-production-e4848`
- Node.js installed
- Access to Firebase Console

## 🚀 Quick Setup

### 1. Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `q-production-e4848`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Save the JSON file as `secrets/serviceAccountKey.json` in your project root

### 2. Verify Setup

Run the development server to verify the setup:

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK connection successful
✅ Admin SDK mode enabled - using real service account
```

## 🔑 Admin User Management

The 10Q-DB app uses **custom claims** to manage admin access. Users must have the `admin: true` claim to access the application.

### Setting Up Admin Claims

Use the provided script to manage admin users:

```bash
# Add admin access for a user
node scripts/manage-admin-users.js add roscoeevans@gmail.com

# Check if a user has admin access
node scripts/manage-admin-users.js check roscoeevans@gmail.com

# Remove admin access
node scripts/manage-admin-users.js remove user@example.com

# List all admin users
node scripts/manage-admin-users.js list
```

### Manual Setup (Alternative)

You can also set admin claims manually using Firebase CLI:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set admin claim for a user (replace UID with actual user UID)
firebase auth:import --hash-algo=SCRYPT users.json
```

Or use the Firebase Admin SDK directly in a script:

```javascript
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = initializeApp({
  credential: cert(require('./secrets/serviceAccountKey.json')),
  projectId: 'q-production-e4848'
});

const auth = getAuth(app);

// Set admin claim for a user
await auth.setCustomUserClaims(uid, { admin: true });
```

## 🔐 Authentication Flow

The 10Q-DB app implements the following authentication flow:

1. **Login Screen**: Users see "Welcome to 10Q-DB. Please sign in with Google to continue."
2. **Google Sign-In**: Users authenticate with their Google account
3. **Admin Claim Check**: App checks for `admin: true` custom claim
4. **Access Control**:
   - ✅ **If admin claim exists**: User gets full access to the app
   - ❌ **If no admin claim**: User sees "You don't have permission to use this app. Please contact Roscoe if you believe this is an error."

## 🛡️ Security Features

### Custom Claims
- Admin access is controlled by Firebase custom claims
- Claims are verified on every authentication
- Claims are cached for 5 minutes to improve performance

### Fallback Systems
The app includes multiple fallback mechanisms:
1. **Primary**: Custom claims (`admin: true`)
2. **Secondary**: Firestore admin users collection
3. **Tertiary**: Hardcoded authorized email list

### Permission Caching
- Permission checks are cached for 5 minutes
- Cache is automatically cleared when users sign out
- Cache can be manually cleared if needed

## 🔧 Development vs Production

### Development Mode
- Uses mock service account if `secrets/serviceAccountKey.json` is missing
- Shows warning messages about missing service account
- Admin operations will fail without proper setup

### Production Mode
- Requires valid service account key
- All admin operations work normally
- Proper error handling and logging

## 📁 File Structure

```
10Q-db/
├── secrets/
│   └── serviceAccountKey.json    # Firebase service account key
├── scripts/
│   └── manage-admin-users.js     # Admin user management script
├── src/
│   ├── lib/
│   │   ├── firebase-admin.ts     # Firebase Admin SDK setup
│   │   ├── auth.ts               # Authentication service
│   │   └── permissions.ts        # Permission checking logic
│   ├── components/
│   │   ├── LoginScreen.tsx       # Login screen component
│   │   └── PermissionDeniedScreen.tsx  # Access denied screen
│   └── hooks/
│       └── useAuth.ts            # Authentication hook
```

## 🚨 Troubleshooting

### Common Issues

1. **"Service account key not found"**
   - Ensure `secrets/serviceAccountKey.json` exists
   - Verify the JSON file is valid
   - Check file permissions

2. **"Admin SDK operations will fail"**
   - You're using the mock service account
   - Add your real service account key to proceed

3. **"User doesn't have admin access"**
   - Use the admin management script to add the user
   - Verify the user has signed in at least once
   - Check if the claim was set correctly

4. **Permission denied after setting claims**
   - Claims may take a few minutes to propagate
   - Ask the user to sign out and sign back in
   - Clear the permission cache if needed

### Debug Commands

```bash
# Check if service account is loaded
node -e "console.log(require('./secrets/serviceAccountKey.json').project_id)"

# Test admin SDK connection
node -e "const { testAdminConnection } = require('./src/lib/firebase-admin.ts'); testAdminConnection()"

# Verify user claims
node scripts/manage-admin-users.js check user@example.com
```

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your service account key is valid
3. Ensure the user has signed in at least once before setting claims
4. Contact Roscoe for admin access issues

## 🔄 Updates and Maintenance

### Adding New Admin Users
1. User signs in with Google at least once
2. Use the admin management script to add them
3. User signs out and signs back in to get access

### Removing Admin Access
1. Use the admin management script to remove access
2. User will lose access on next sign-in
3. Consider clearing their permission cache

### Updating Claims
- Claims are updated immediately
- Users may need to sign out and back in to see changes
- The app will automatically refresh claims on next authentication 