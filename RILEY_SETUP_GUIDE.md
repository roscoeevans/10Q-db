# 🚀 Riley's 10Q-db Setup Guide for Cursor AI

## Overview
This guide provides step-by-step instructions for Cursor AI to help Riley set up the 10Q-db project. The project is a modern, iOS-style question management tool for creating and organizing daily quiz sets with AI-powered generation.

## 📋 Prerequisites Check
Before starting, ensure Riley has:
- **Node.js 18+** installed
- **Git** installed
- **A Google account** for authentication
- **Admin access** (will be granted by Roscoe after initial setup)

## 🔧 Step-by-Step Setup Instructions

### Step 1: Verify Node.js Installation
First, check if Node.js is installed and up to date:

```bash
node --version
npm --version
```

**If Node.js is not installed:**
- **macOS**: `brew install node` (if Homebrew is installed) or download from https://nodejs.org/
- **Windows**: Download and install from https://nodejs.org/
- **Linux**: Use package manager or download from https://nodejs.org/

### Step 2: Clone the Repository
Navigate to where Riley wants to store the project and clone it:

```bash
# Navigate to desired directory (e.g., Desktop or Documents)
cd ~/Desktop

# Clone the repository
git clone https://github.com/roscoeevans/10Q-db.git

# Navigate into the project directory
cd 10Q-db
```

### Step 3: Install Dependencies
Install all required packages:

```bash
npm install
```

This will install all the necessary dependencies listed in package.json.

### Step 4: Set Up Firebase Configuration
Riley needs the Firebase service account key from Roscoe:

1. **Contact Roscoe** to get the Firebase service account key file
2. **Create the secrets directory:**
   ```bash
   mkdir secrets
   ```
3. **Save the service account key** as `secrets/serviceAccountKey.json`
   - The file should be placed in the `secrets/` folder
   - Make sure the filename is exactly `serviceAccountKey.json`
   - This file contains sensitive credentials and is gitignored

### Step 5: Set Up Environment Variables
Create the environment file:

```bash
# Copy the example environment file
cp .env.example .env.local
```

**Note:** The `.env.local` file should already contain the Firebase configuration values. If not, Riley will need to get these from Roscoe.

### Step 6: Start the Development Server
Start the development server:

```bash
npm run dev
```

The app should start and be available at `http://localhost:5173`

### Step 7: Get Admin Access
This is a critical step - Riley cannot use the app without admin access:

1. **Open the app** in a web browser (http://localhost:5173)
2. **Sign in with Google** (Riley will see a permission denied message - this is normal)
3. **Contact Roscoe** with Riley's Google email address to request admin access
4. **Wait for confirmation** that admin access has been granted
5. **Sign out and sign back in** to get the updated permissions

## 🛠️ Available Commands

Once set up, Riley can use these commands:

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

## 🚨 Troubleshooting Common Issues

### "Permission denied" error
- Make sure Riley has signed in with Google first
- Contact Roscoe to request admin access
- Sign out and sign back in after access is granted

### "Cannot find module" errors
- Run `npm install` to install dependencies
- Make sure Riley is in the correct directory (`10Q-db`)

### Firebase connection errors
- Verify `secrets/serviceAccountKey.json` exists
- Check that the file contains valid JSON
- Contact Roscoe if the service account key is invalid

### Port already in use
- The app uses port 5173 by default
- If it's busy, the terminal will show an alternative port
- Use the URL shown in the terminal

## 📱 Using the App

Once Riley has admin access:

1. **Sign in** with Google account
2. **Upload questions** using the question upload flow
3. **Organize questions** by categories and tags
4. **Generate questions** using the AI integration
5. **Manage quiz sets** through the interface

## 🔄 Updating the Repository

When there are updates to the project:

```bash
# Pull the latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the development server
npm run dev
```

## 📞 Support Contacts

- **Admin access issues**: Contact Roscoe
- **Technical problems**: Check the troubleshooting section above
- **Firebase setup**: See FIREBASE_ADMIN_SETUP.md
- **Security questions**: See SECURITY.md

## 🎯 Key Points for Riley

1. **Admin access is required** - Riley cannot use the app without it
2. **Google sign-in is mandatory** - The app uses Google authentication
3. **Service account key is needed** - This must come from Roscoe
4. **Permission denied is normal initially** - This will be resolved once admin access is granted
5. **Sign out and back in** - Required after admin access is granted

## 🔐 Security Notes

- The `secrets/` directory is gitignored and contains sensitive files
- Environment variables are properly configured
- Admin access is controlled by Firebase custom claims
- All sensitive information is externalized and not hardcoded

---

**Remember:** Riley must contact Roscoe for the Firebase service account key and admin access. These are the two most critical steps for getting the app working. 