# 10Q Database

A modern, iOS-style question management tool for creating and organizing daily quiz sets with AI-powered generation.

## 🔐 Authentication & Access Control

### Google Login + Admin Check Flow

The app implements a secure authentication system with the following flow:

1. **Login Screen**: Users see "Welcome to 10Q-DB. Please sign in with Google to continue."
2. **Google Sign-In**: Users authenticate with their Google account
3. **Admin Claim Check**: App checks for `admin: true` custom claim
4. **Access Control**:
   - ✅ **If admin claim exists**: User gets full access to the app
   - ❌ **If no admin claim**: User sees "You don't have permission to use this app. Please contact Roscoe if you believe this is an error."

### Setting Up Admin Access

To grant admin access to a user:

1. **User must sign in first**: The user needs to sign in with Google at least once
2. **Use the admin script**: Run the management script to add admin claims
3. **User signs out and back in**: To get the updated permissions

```bash
# Add admin access for a user
node scripts/manage-admin-users.js add roscoeevans@gmail.com

# Check if a user has admin access
node scripts/manage-admin-users.js check roscoeevans@gmail.com

# List all admin users
node scripts/manage-admin-users.js list
```

For detailed setup instructions, see [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md).

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project access
- Service account key (see setup guide)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 10Q-db

# Install dependencies
npm install

# Set up Firebase (see FIREBASE_ADMIN_SETUP.md)
# Download service account key to secrets/serviceAccountKey.json

# Start development server
npm run dev
```

### Firebase Setup

1. Download service account key from Firebase Console
2. Save as `secrets/serviceAccountKey.json`
3. Set up admin users using the management script

See [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) for detailed instructions.

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📁 Project Structure

```
10Q-db/
├── src/
│   ├── components/           # React components
│   │   ├── LoginScreen.tsx   # Google sign-in screen
│   │   ├── PermissionDeniedScreen.tsx  # Access denied screen
│   │   └── QuestionUploadFlow.tsx      # Main app functionality
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts        # Authentication hook
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication service
│   │   ├── permissions.ts    # Permission checking logic
│   │   ├── firebase.ts       # Firebase client config
│   │   └── firebase-admin.ts # Firebase admin config
│   └── App.tsx               # Main app component
├── scripts/
│   └── manage-admin-users.js # Admin user management script
├── secrets/                  # Service account keys (gitignored)
└── FIREBASE_ADMIN_SETUP.md   # Setup documentation
```

## 🔧 Features

- **Google Authentication**: Secure sign-in with Google accounts
- **Admin Access Control**: Custom claims-based permission system
- **Question Management**: Upload and organize quiz questions
- **AI Integration**: Generate questions using AI (mock implementation)
- **iOS-Style UI**: Modern, responsive interface
- **Real-time Updates**: Live data synchronization
- **Permission Caching**: Optimized performance with 5-minute cache

## 🛡️ Security

- **Custom Claims**: Admin access controlled by Firebase custom claims
- **Service Account**: Secure server-side operations
- **Permission Caching**: Optimized with automatic cache invalidation
- **Fallback Systems**: Multiple authentication methods for reliability

## 📞 Support

For admin access issues or technical support, contact Roscoe.

## 📄 License

Internal tool for authorized users only.
