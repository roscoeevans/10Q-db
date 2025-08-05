#!/usr/bin/env node

/**
 * 🧪 Test Firestore Write Permissions
 * 
 * This script tests if the current user can write to the questions collection.
 * It attempts to upload a single test question and then clean it up.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '../secrets/serviceAccountKey.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  console.log('✅ Loaded service account key');
} catch (error) {
  console.error('❌ Failed to load service account key from secrets/serviceAccountKey.json');
  console.error('   Please ensure you have downloaded the service account key from Firebase Console');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'q-production-e4848'
});

const db = getFirestore(app);

async function testFirestoreWrite() {
  const testQuestionId = `test-${Date.now()}`;
  const testQuestion = {
    id: testQuestionId,
    question: "This is a test question to verify Firestore write permissions",
    choices: ["Correct Answer", "Wrong Answer 1", "Wrong Answer 2", "Wrong Answer 3"],
    answer: "Correct Answer",
    date: "test-date",
    difficulty: 5,
    lastUsed: "",
    tags: ["test", "permission-check"]
  };

  try {
    console.log('🧪 Testing Firestore write permissions...');
    console.log(`📝 Attempting to write test question: ${testQuestionId}`);
    
    // Test 1: Write to questions collection
    const questionRef = db.collection('questions').doc(testQuestionId);
    await questionRef.set(testQuestion);
    console.log('✅ Successfully wrote to questions collection');
    
    // Test 2: Read back the question to verify
    const readQuestion = await questionRef.get();
    if (readQuestion.exists) {
      console.log('✅ Successfully read back the test question');
      console.log('📋 Question data:', readQuestion.data());
    } else {
      console.log('❌ Failed to read back the test question');
    }
    
    // Test 3: Write to tags collection
    const tagRef = db.collection('tags').doc('test-tag');
    await tagRef.set({
      name: 'test-tag',
      questionCount: 1,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Successfully wrote to tags collection');
    
    // Test 4: Write to tag questions subcollection
    const tagQuestionRef = db.collection('tags').doc('test-tag').collection('questions').doc(testQuestionId);
    await tagQuestionRef.set({ questionId: testQuestionId });
    console.log('✅ Successfully wrote to tag questions subcollection');
    
    console.log('\n🎉 All Firestore write tests passed!');
    console.log('✅ You have proper permissions to upload questions');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await questionRef.delete();
    await tagQuestionRef.delete();
    await tagRef.delete();
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Firestore write test failed:', error.message);
    console.error('📋 Error details:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 This indicates a permissions issue. Possible solutions:');
      console.log('1. Check if you have the admin custom claim set');
      console.log('2. Verify the service account has proper permissions');
      console.log('3. Check Firestore security rules');
    }
    
    process.exit(1);
  }
}

async function main() {
  await testFirestoreWrite();
}

main().catch(console.error); 