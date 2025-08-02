# Security Policy

## 🔒 Security Overview

The 10Q Database is a private tool with restricted access. We take security seriously and have implemented multiple layers of protection.

## 🛡️ Security Measures

### Authentication & Authorization
- **Google OAuth**: Secure authentication via Google accounts
- **Custom Claims**: Admin access controlled by Firebase custom claims
- **Permission Caching**: Optimized with automatic cache invalidation
- **Fallback Systems**: Multiple authentication methods for reliability

### Data Protection
- **Firebase Security Rules**: Comprehensive Firestore security rules
- **Service Account**: Secure server-side operations
- **Environment Variables**: Sensitive configuration stored securely
- **Input Validation**: All user inputs are validated

### Repository Security
- **Secrets Exclusion**: Sensitive files are properly gitignored
- **No Hardcoded Secrets**: All API keys and credentials are externalized
- **Access Control**: Repository access is restricted to authorized users

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. **Contact Roscoe directly** for immediate attention
3. **Provide details** about the vulnerability
4. **Include steps** to reproduce if possible

## 🔐 Access Management

### Admin Access
- Admin access is granted through Firebase custom claims
- Use the management script: `node scripts/manage-admin-users.js`
- Contact Roscoe for admin access requests

### Service Account
- Service account keys are stored in `secrets/serviceAccountKey.json`
- This file is excluded from version control
- Never commit or share service account credentials

## 📋 Security Checklist

### For Developers
- [ ] No API keys in code
- [ ] All secrets in `.gitignore`
- [ ] Firebase rules properly configured
- [ ] Authentication flows tested
- [ ] Permission checks implemented
- [ ] Input validation in place

### For Deployment
- [ ] Environment variables set
- [ ] Service account key secured
- [ ] Firebase project configured
- [ ] Security rules deployed
- [ ] Admin users configured

## 🔄 Security Updates

- Regular dependency updates
- Firebase security rule reviews
- Authentication flow audits
- Permission system validation

## 📞 Security Contact

For security-related issues or questions:
- **Primary Contact**: Roscoe
- **Repository**: https://github.com/roscoeevans/10Q-db
- **Documentation**: See FIREBASE_ADMIN_SETUP.md for detailed security setup

## 📄 Security Documentation

- [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) - Firebase security setup
- [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) - Permission system details
- [firestore.rules](./firestore.rules) - Firestore security rules 