# 10Q Database

A modern, iOS-style question management tool for creating and organizing daily quiz sets with AI-powered generation.

## ⚡ Quick Start for Employees

**Need to get up and running fast? Here's the essential setup:**

1. **Install Node.js** (if not already installed) from https://nodejs.org/
2. **Clone the repo:** `git clone https://github.com/roscoeevans/10Q-db.git`
3. **Install dependencies:** `cd 10Q-db && npm install`
4. **Get Firebase key** from Roscoe and save as `secrets/serviceAccountKey.json`
5. **Start the app:** `npm run dev`
6. **Sign in with Google** and contact Roscoe for admin access
7. **Sign out and back in** after access is granted

**That's it!** For detailed instructions, see the [Employee Setup Guide](#-employee-setup-guide) below.

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

## ✨ Features

### 🤖 AI-Powered Question Generation
- **Smart Generation**: AI creates 10 Jeopardy-style questions with progressive difficulty
- **Theme-Based**: Questions are generated based on your chosen theme (e.g., "World History", "Science", "Pop Culture")
- **Quality Control**: Each question includes 4 multiple choice options and 3 hierarchical tags

### 🔄 Deny & Regenerate Feature
- **Feedback-Driven**: Click "Deny & Regenerate" to provide feedback on any question
- **Smart Regeneration**: AI uses your feedback to create a better replacement question
- **Context-Aware**: The AI considers other approved questions to avoid duplicates and maintain consistency
- **Maintains Difficulty**: Regenerated questions maintain the same difficulty level as the original

### 📊 Question Management
- **Visual Progress**: See which questions are approved with progress indicators
- **Edit Interface**: Modify questions, choices, and tags before approval
- **Batch Upload**: Upload all 10 questions at once to the database

## 🚀 Employee Setup Guide

### 📋 Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed on your computer
- **Git** installed on your computer
- **Google account** that will be used for authentication
- **Admin access** granted by Roscoe (see "Getting Admin Access" below)

### 🔧 Step-by-Step Setup Instructions

#### 1. Install Node.js (if not already installed)

**macOS/Linux:**
```bash
# Using Homebrew (macOS)
brew install node

# Or download from https://nodejs.org/
```

**Windows:**
- Download and install from https://nodejs.org/

**Verify installation:**
```bash
node --version  # Should show v18 or higher
npm --version   # Should show 8 or higher
```

#### 2. Clone the Repository

```bash
# Clone the repository to your computer
git clone https://github.com/roscoeevans/10Q-db.git

# Navigate into the project directory
cd 10Q-db
```

#### 3. Install Dependencies

```bash
# Install all required packages
npm install
```

#### 4. Set Up Firebase Configuration

**You'll need the Firebase service account key from Roscoe:**

1. **Contact Roscoe** to get the Firebase service account key file
2. **Create the secrets directory:**
   ```bash
   mkdir secrets
   ```
3. **Save the service account key** as `secrets/serviceAccountKey.json`
   - The file should be placed in the `secrets/` folder
   - Make sure the filename is exactly `serviceAccountKey.json`

#### 5. Get Admin Access

**Before you can use the app, you need admin access:**

1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open your browser** and go to `http://localhost:5173`
3. **Sign in with your Google account** (you'll see a permission denied message - this is normal)
4. **Contact Roscoe** with your Google email address to request admin access
5. **Wait for confirmation** that admin access has been granted
6. **Sign out and sign back in** to get the updated permissions

#### 6. Start Development

```bash
# Start the development server
npm run dev

# The app will open at http://localhost:5173
```

### 🔐 Getting Admin Access

**If you see "You don't have permission to use this app":**

1. **Sign in first** - You must sign in with Google at least once
2. **Contact Roscoe** with your Google email address
3. **Wait for confirmation** that admin access has been granted
4. **Sign out and sign back in** to refresh your permissions

**Roscoe will run this command to grant you access:**
```bash
node scripts/manage-admin-users.js add your-email@gmail.com
```

### 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting (code quality check)
npm run lint
```

### 🚨 Troubleshooting

**"Permission denied" error:**
- Make sure you've signed in with Google first
- Contact Roscoe to request admin access
- Sign out and sign back in after access is granted

**"Cannot find module" errors:**
- Run `npm install` to install dependencies
- Make sure you're in the correct directory (`10Q-db`)

**Firebase connection errors:**
- Verify `secrets/serviceAccountKey.json` exists
- Check that the file contains valid JSON
- Contact Roscoe if the service account key is invalid

**Port already in use:**
- The app uses port 5173 by default
- If it's busy, the terminal will show an alternative port
- Use the URL shown in the terminal

### 📱 Using the App

Once you have admin access:

1. **Sign in** with your Google account
2. **Upload questions** using the question upload flow
3. **Organize questions** by categories and tags
4. **Generate questions** using the AI integration
5. **Manage your quiz sets** through the interface

### 🔄 Updating the Repository

When there are updates to the project:

```bash
# Pull the latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the development server
npm run dev
```

### 📞 Need Help?

- **Admin access issues**: Contact Roscoe
- **Technical problems**: Check the troubleshooting section above
- **Firebase setup**: See [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md)
- **Security questions**: See [SECURITY.md](./SECURITY.md)

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
