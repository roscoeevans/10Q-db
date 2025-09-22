# 🔑 Firebase Service Account Setup Guide

This guide will help you set up the Firebase service account key needed for admin operations.

## 📋 Prerequisites

- Access to Firebase Console
- Project: `q-production-e4848`

## 🚀 Step-by-Step Setup

### Step 1: Download Service Account Key

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Choose: `q-production-e4848`

3. **Open Project Settings**
   - Click the gear icon (⚙️) in the top left
   - Select "Project settings"

4. **Go to Service Accounts Tab**
   - Click the "Service accounts" tab
   - You should see "Firebase Admin SDK"

5. **Generate Private Key**
   - Click "Generate new private key"
   - Click "Generate key" in the popup
   - The JSON file will download automatically

### Step 2: Save the Key File

1. **Move the downloaded file**
   - Rename it to: `serviceAccountKey.json`
   - Move it to: `secrets/serviceAccountKey.json` in your project

2. **Verify the file structure**
   ```bash
   ls -la secrets/serviceAccountKey.json
   ```

### Step 3: Test the Setup

Run the verification script:

```bash
node scripts/verify-setup.js
```

You should see:
```
✅ Service account key loaded successfully
✅ Firebase Admin SDK initialized successfully
✅ Authentication test passed
✅ Firestore read test passed
✅ Firestore write test passed
```

### Step 4: Set Admin Claims

If the verification shows you don't have admin claims:

```bash
node scripts/manage-admin-users.js add riley.c.evans@gmail.com
```

### Step 5: Test Upload

Now try the upload test in your app:
1. Go to Settings tab
2. Click "Test Upload"
3. Should see: "✅ Upload test successful!"

## 🔒 Security Notes

- **Never commit** `secrets/serviceAccountKey.json` to version control
- The file is already in `.gitignore`
- Keep the key secure and don't share it

## 🚨 Troubleshooting

### "Failed to load service account key"
- Make sure the file exists at `secrets/serviceAccountKey.json`
- Check that the JSON file is valid

### "Authentication test failed"
- The service account might not have proper permissions
- Contact the project owner to grant admin access

### "Firestore write test failed"
- Check Firestore security rules
- Ensure the service account has write permissions

## 📞 Support

If you encounter issues:
1. Check the verification script output
2. Ensure you have proper access to the Firebase project
3. Contact the project administrator if needed 