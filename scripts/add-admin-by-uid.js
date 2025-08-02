#!/usr/bin/env node

/**
 * 🔐 Add Admin Access by UID Script for 10Q-DB
 * 
 * This script adds admin access for users by their UIDs.
 * It first looks up the user by UID to get their email, then sets the admin claim.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

const auth = getAuth(app);

async function addAdminByUID(uid) {
  try {
    console.log(`🔍 Looking up user by UID: ${uid}`);
    
    // Get user by UID
    const userRecord = await auth.getUser(uid);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.email})`);
    
    // Set custom claims
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Set admin: true claim for ${userRecord.email} (UID: ${uid})`);
    
    // Verify the claim was set
    const updatedUser = await auth.getUser(uid);
    console.log(`📋 User claims:`, updatedUser.customClaims);
    
    return userRecord.email;
    
  } catch (error) {
    console.error(`❌ Error adding admin user with UID ${uid}:`, error.message);
    throw error;
  }
}

async function checkUserByUID(uid) {
  try {
    console.log(`🔍 Looking up user by UID: ${uid}`);
    
    // Get user by UID
    const userRecord = await auth.getUser(uid);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.email})`);
    console.log(`📋 User claims:`, userRecord.customClaims);
    
    if (userRecord.customClaims && userRecord.customClaims.admin === true) {
      console.log(`✅ User ${userRecord.email} has admin access`);
    } else {
      console.log(`❌ User ${userRecord.email} does NOT have admin access`);
    }
    
    return userRecord.email;
    
  } catch (error) {
    console.error(`❌ Error checking user with UID ${uid}:`, error.message);
    throw error;
  }
}

// Main script logic
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const uid = args[1];
  
  console.log('🔐 10Q-DB Add Admin by UID Script');
  console.log('==================================\n');
  
  if (command === 'add' && uid) {
    try {
      await addAdminByUID(uid);
      console.log('\n✅ Successfully added admin access');
    } catch (error) {
      console.error('\n❌ Failed to add admin access');
      process.exit(1);
    }
  } else if (command === 'check' && uid) {
    try {
      await checkUserByUID(uid);
    } catch (error) {
      console.error('\n❌ Failed to check user');
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  node scripts/add-admin-by-uid.js add <uid>     - Add admin access by UID');
    console.log('  node scripts/add-admin-by-uid.js check <uid>   - Check user by UID');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/add-admin-by-uid.js add lASykEarYIgkPQ93gulVATgv3U33');
    console.log('  node scripts/add-admin-by-uid.js check lASykEarYIgkPQ93gulVATgv3U33');
  }
  
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 