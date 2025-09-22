# 🔐 Question Upload Permission Tests

This document explains how to test the permissions required for uploading questions to Firestore in the 10Q-DB application.

## Overview

The permission tests ensure that only users with proper admin permissions can upload questions to Firestore. This is critical for maintaining data integrity and security.

## Test Types

### 1. Unit Tests (`questionUploadPermissions.test.ts`)
- **Location**: `src/features/questions/services/__tests__/questionUploadPermissions.test.ts`
- **Purpose**: Test the upload logic and validation in isolation
- **Scope**: Mocked Firebase operations, no real database calls
- **Speed**: Fast execution

### 2. Integration Tests (`test-question-upload-permissions.js`)
- **Location**: `scripts/test-question-upload-permissions.js`
- **Purpose**: Test actual Firestore security rules and permissions
- **Scope**: Real Firebase operations, actual database calls
- **Speed**: Slower execution (requires network calls)

### 3. Test Runner (`run-permission-tests.js`)
- **Location**: `scripts/run-permission-tests.js`
- **Purpose**: Run both unit and integration tests together
- **Scope**: Comprehensive testing suite
- **Speed**: Complete test suite execution

## Running the Tests

### Quick Start
```bash
# Run all permission tests (recommended)
npm run test:permissions
```

### Individual Test Types
```bash
# Run only unit tests
npm run test:permissions:unit

# Run only integration tests
npm run test:permissions:integration
```

### Manual Execution
```bash
# Run unit tests directly
npm test -- --run src/features/questions/services/__tests__/questionUploadPermissions.test.ts

# Run integration tests directly
node scripts/test-question-upload-permissions.js

# Run test runner directly
node scripts/run-permission-tests.js
```

## What the Tests Verify

### Admin Permission Required
- ✅ **Admin users** can upload questions successfully
- ❌ **Non-admin users** are blocked from uploading
- ❌ **Unauthenticated users** are blocked from uploading
- ❌ **Users with no claims** are blocked from uploading

### Firestore Security Rules Compliance
- ✅ Documents are created with correct structure
- ✅ Questions collection follows proper schema
- ✅ Tags collection is properly organized
- ✅ Atomic batch operations ensure data consistency

### Error Handling
- ✅ Permission-denied errors are handled gracefully
- ✅ Database unavailable errors are handled
- ✅ Generic Firebase errors are propagated correctly

### Validation Before Upload
- ✅ Exactly 10 questions are required
- ✅ Date format validation (YYYY-MM-DD)
- ✅ No duplicate questions for the same date
- ✅ Question structure validation
- ✅ Answer must match first choice
- ✅ Exactly 3 tags required per question

## Test Configuration

### Unit Tests
- **Mocked Dependencies**: Firebase Auth, Firestore, permissions
- **Test Data**: Sample questions with various configurations
- **Validation**: All upload scenarios and error conditions

### Integration Tests
- **Real Dependencies**: Firebase Admin SDK, actual Firestore database
- **Test Data**: Real questions uploaded to test database
- **Cleanup**: Automatic cleanup of test data after execution
- **User Verification**: Checks actual user claims and permissions

## Prerequisites

### For Unit Tests
- Node.js and npm installed
- Project dependencies installed (`npm install`)
- No additional setup required

### For Integration Tests
- Firebase service account key in `secrets/serviceAccountKey.json`
- Admin user exists in Firebase Auth
- Network access to Firebase project

## Test Output

### Unit Tests Output
```
📋 Running Unit Tests...
------------------------
✅ Unit tests completed successfully

Question Upload Permissions
  Admin Permission Required
    ✅ should allow upload when user has admin claim
    ✅ should deny upload when user lacks admin claim
    ✅ should deny upload when user has no claims
    ✅ should deny upload when user is not authenticated
  Firestore Security Rules Compliance
    ✅ should create documents with correct structure for questions collection
    ✅ should create documents with correct structure for tags collection
    ✅ should use atomic batch operations for data consistency
  Error Handling for Permission Issues
    ✅ should handle permission-denied error specifically
    ✅ should handle unavailable database error
    ✅ should handle generic Firebase errors
  Validation Before Upload
    ✅ should validate question count before attempting upload
    ✅ should validate date format before attempting upload
    ✅ should check for existing questions before upload
  Question Structure Validation
    ✅ should validate question structure before upload
    ✅ should validate answer matches first choice
    ✅ should validate tag structure
```

### Integration Tests Output
```
🔐 10Q-DB Question Upload Permissions Test
==========================================

🔧 Setting up test users...
✅ Found admin user: roscoeevans@gmail.com (abc123...)
   Claims: { admin: true }

🔐 Testing Question Upload Permissions
=====================================

📝 Test 1: Admin User Upload
----------------------------
✅ Admin user upload succeeded

📝 Test 2: Non-Admin User Upload
--------------------------------
✅ Non-admin user correctly lacks admin claims

📝 Test 3: Unauthenticated User Upload
--------------------------------------
✅ Unauthenticated user correctly blocked (simulated)

🛡️  Verifying Firestore Security Rules
=====================================
✅ Found 2 test questions in database
   Question 2024-12-25-q0:
     - Question: What is the capital of France?
     - Answer: Paris
     - Difficulty: 1
     - Tags: geography, europe, capitals
   Question 2024-12-25-q1:
     - Question: Which planet is closest to the Sun?
     - Answer: Mercury
     - Difficulty: 2
     - Tags: science, astronomy, planets
✅ Tag 'geography' has 1 question references
✅ Tag 'europe' has 1 question references
✅ Tag 'capitals' has 1 question references
✅ Tag 'science' has 1 question references
✅ Tag 'astronomy' has 1 question references
✅ Tag 'planets' has 1 question references

📊 Test Results Summary
======================
Total Tests: 3
Passed: 3
Failed: 0

Detailed Results:
-----------------
✅ PASS adminUser
✅ PASS nonAdminUser
✅ PASS unauthenticated

Security Rules: ✅ VERIFIED

Overall Result: ✅ ALL TESTS PASSED

🎉 Question upload permissions are working correctly!
   Only admin users can upload questions to Firestore.
```

## Troubleshooting

### Common Issues

#### Unit Tests Fail
- **Problem**: Mock setup issues
- **Solution**: Check that all Firebase modules are properly mocked
- **Debug**: Run `npm run test:permissions:unit -- --verbose`

#### Integration Tests Fail
- **Problem**: Missing service account key
- **Solution**: Ensure `secrets/serviceAccountKey.json` exists and is valid
- **Debug**: Check Firebase Console for service account key

#### Permission Denied Errors
- **Problem**: User lacks admin claims
- **Solution**: Use admin management script to add admin claims
- **Debug**: Run `node scripts/manage-admin-users.js check user@example.com`

#### Network Errors
- **Problem**: Firebase project not accessible
- **Solution**: Check internet connection and Firebase project settings
- **Debug**: Verify project ID in service account key matches Firebase Console

### Debug Commands
```bash
# Check service account key
node -e "console.log(require('./secrets/serviceAccountKey.json').project_id)"

# Check user permissions
node scripts/manage-admin-users.js check roscoeevans@gmail.com

# Test Firebase connection
node -e "const { testAdminConnection } = require('./src/lib/firebase-admin.ts'); testAdminConnection()"

# Run tests with verbose output
npm run test:permissions:unit -- --verbose
```

## Security Considerations

### What the Tests Don't Cover
- **Client-side security**: These tests focus on server-side validation
- **Real-time attacks**: No testing of concurrent access patterns
- **Data tampering**: No testing of malicious data injection
- **Rate limiting**: No testing of upload frequency limits

### Additional Security Measures
- **Firestore Security Rules**: Must be configured correctly
- **Custom Claims**: Must be set properly for admin users
- **Input Validation**: Must be implemented in client code
- **Error Handling**: Must not expose sensitive information

## Continuous Integration

### GitHub Actions (Recommended)
Add this to your `.github/workflows/test.yml`:

```yaml
- name: Run Permission Tests
  run: npm run test:permissions
  env:
    FIREBASE_SERVICE_ACCOUNT_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
```

### Pre-commit Hooks
Add this to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:permissions:unit"
    }
  }
}
```

## Contributing

When adding new permission-related features:

1. **Add unit tests** for the new functionality
2. **Add integration tests** if database operations are involved
3. **Update this documentation** with new test scenarios
4. **Run the full test suite** before submitting changes

## Support

If you encounter issues with the permission tests:

1. Check the troubleshooting section above
2. Review the test output for specific error messages
3. Verify your Firebase configuration
4. Contact the development team for assistance

---

**Note**: These tests are critical for maintaining the security of the 10Q-DB application. Always run them before deploying changes that affect question upload functionality. 