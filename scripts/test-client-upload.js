#!/usr/bin/env node

/**
 * 🧪 Test Client-Side Upload Process
 * 
 * This script simulates the client-side upload process that your app uses.
 * It tests the actual flow with Firebase client SDK.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testClientUpload() {
  try {
    console.log('🧪 Testing client-side upload process...');
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('❌ No user authenticated. Please sign in first.');
      console.log('💡 You can sign in through the web app, then run this test.');
      return;
    }
    
    console.log(`✅ User authenticated: ${auth.currentUser.email}`);
    
    // Get ID token to check claims
    const idTokenResult = await auth.currentUser.getIdTokenResult();
    console.log('📋 User claims:', idTokenResult.claims);
    
    if (!idTokenResult.claims.admin) {
      console.log('❌ User does not have admin claim. Upload will fail.');
      console.log('💡 Set admin claim using: node scripts/manage-admin-users.js add <email>');
      return;
    }
    
    console.log('✅ User has admin claim. Proceeding with upload test...');
    
    // Test question data (similar to your app)
    const testQuestions = [
      {
        question: "What is the capital of France?",
        choices: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris",
        date: "test-date",
        tags: ["geography", "test"]
      }
    ];
    
    const targetDate = "test-date";
    
    // Simulate the upload process from your app
    console.log('📝 Attempting to upload test questions...');
    
    const batch = writeBatch(db);
    
    // Process each question (same logic as your app)
    testQuestions.forEach((questionData, index) => {
      const questionId = `${targetDate}-q${index}`;
      
      // Create the question document
      const questionDocRef = doc(db, 'questions', questionId);
      const firestoreQuestion = {
        id: questionId,
        question: questionData.question,
        choices: questionData.choices,
        answer: questionData.answer,
        date: targetDate,
        difficulty: index + 1,
        lastUsed: "",
        tags: questionData.tags
      };
      
      batch.set(questionDocRef, firestoreQuestion);
      
      // Add to tag subcollections
      questionData.tags.forEach(tag => {
        const tagQuestionsRef = doc(db, 'tags', tag, 'questions', questionId);
        batch.set(tagQuestionsRef, { questionId });
      });
    });
    
    // Commit the batch
    await batch.commit();
    console.log('✅ Successfully uploaded test questions using client SDK!');
    console.log('🎉 Client-side upload test passed!');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    const cleanupBatch = writeBatch(db);
    
    testQuestions.forEach((_, index) => {
      const questionId = `${targetDate}-q${index}`;
      const questionDocRef = doc(db, 'questions', questionId);
      cleanupBatch.delete(questionDocRef);
      
      // Clean up tag references
      testQuestions[index].tags.forEach(tag => {
        const tagQuestionsRef = doc(db, 'tags', tag, 'questions', questionId);
        cleanupBatch.delete(tagQuestionsRef);
      });
    });
    
    await cleanupBatch.commit();
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Client upload test failed:', error.message);
    console.error('📋 Error details:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Permission denied. This means:');
      console.log('1. User does not have admin custom claim');
      console.log('2. Firestore security rules are blocking the write');
      console.log('3. Service account permissions are insufficient');
    }
    
    process.exit(1);
  }
}

async function main() {
  console.log('🔧 Note: This test requires you to be signed in through the web app first.');
  console.log('   Run the web app, sign in, then run this test.');
  console.log('');
  
  await testClientUpload();
}

main().catch(console.error); 