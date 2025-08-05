#!/usr/bin/env node

/**
 * 🔍 Debug Client SDK Permissions
 * 
 * This script helps debug what the client SDK sees for user permissions.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "q-production-e4848.firebaseapp.com",
  projectId: "q-production-e4848",
  storageBucket: "q-production-e4848.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function debugPermissions() {
  try {
    console.log('🔍 Debugging client-side permissions...');
    
    // Check if user is signed in
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user signed in');
      return;
    }
    
    console.log('✅ User signed in:', user.email);
    
    // Get token claims
    const token = await user.getIdTokenResult();
    console.log('📋 Token claims:', token.claims);
    
    // Test Firestore write
    const testDoc = doc(db, 'questions', 'debug-test');
    await setDoc(testDoc, {
      test: true,
      timestamp: new Date().toISOString(),
      userId: user.uid
    });
    
    console.log('✅ Firestore write test successful');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugPermissions(); 