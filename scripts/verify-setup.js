#!/usr/bin/env node

/**
 * 🔍 Verify Firebase Setup and Permissions
 * 
 * This script checks if the Firebase setup is correct and permissions are working.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying Firebase setup...');

// Check 1: Service Account Key
console.log('\n1️⃣ Checking service account key...');
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '../secrets/serviceAccountKey.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  console.log('✅ Service account key loaded successfully');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
} catch (error) {
  console.error('❌ Failed to load service account key');
  console.error('   Please download it from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

// Check 2: Initialize Firebase Admin
console.log('\n2️⃣ Initializing Firebase Admin SDK...');
let app, auth, db;
try {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: 'q-production-e4848'
  });
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

// Check 3: Test Authentication
console.log('\n3️⃣ Testing authentication...');
try {
  // Try to list users (this requires admin permissions)
  const listUsersResult = await auth.listUsers(1);
  console.log('✅ Authentication test passed');
  console.log(`   Can list users: ${listUsersResult.users.length > 0 ? 'Yes' : 'No users found'}`);
} catch (error) {
  console.error('❌ Authentication test failed:', error.message);
  process.exit(1);
}

// Check 4: Test Firestore Access
console.log('\n4️⃣ Testing Firestore access...');
try {
  // Try to read from questions collection
  const questionsRef = db.collection('questions');
  const snapshot = await questionsRef.limit(1).get();
  console.log('✅ Firestore read test passed');
  console.log(`   Questions in database: ${snapshot.size}`);
} catch (error) {
  console.error('❌ Firestore read test failed:', error.message);
  process.exit(1);
}

// Check 5: Test Firestore Write
console.log('\n5️⃣ Testing Firestore write...');
try {
  const testDocId = `test-${Date.now()}`;
  const testRef = db.collection('questions').doc(testDocId);
  
  // Write test document
  await testRef.set({
    id: testDocId,
    question: 'Test question for permissions',
    choices: ['A', 'B', 'C', 'D'],
    answer: 'A',
    date: 'test',
    difficulty: 1,
    lastUsed: '',
    tags: ['test']
  });
  console.log('✅ Firestore write test passed');
  
  // Clean up
  await testRef.delete();
  console.log('✅ Test document cleaned up');
} catch (error) {
  console.error('❌ Firestore write test failed:', error.message);
  process.exit(1);
}

// Check 6: Check User Claims
console.log('\n6️⃣ Checking user claims...');
const userEmail = 'riley.c.evans@gmail.com';
try {
  const userRecord = await auth.getUserByEmail(userEmail);
  console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.uid})`);
  console.log('📋 User claims:', userRecord.customClaims);
  
  if (userRecord.customClaims && userRecord.customClaims.admin === true) {
    console.log('✅ User has admin claim');
  } else {
    console.log('❌ User does not have admin claim');
    console.log('💡 To add admin claim, run:');
    console.log(`   node scripts/manage-admin-users.js add ${userEmail}`);
  }
} catch (error) {
  console.error('❌ Error checking user claims:', error.message);
}

console.log('\n🎉 Setup verification complete!');
console.log('✅ If all tests passed, your Firebase setup is working correctly.');
console.log('💡 If any tests failed, follow the instructions above to fix them.'); 