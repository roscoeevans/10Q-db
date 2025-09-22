#!/usr/bin/env node

/**
 * 🔍 Check Current User Permissions
 * 
 * This script checks the current user's permissions and claims.
 * Run this after setting up the service account key.
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

async function checkUserPermissions(email) {
  try {
    console.log(`🔍 Checking permissions for: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.uid})`);
    
    console.log(`📋 User claims:`, userRecord.customClaims);
    
    if (userRecord.customClaims && userRecord.customClaims.admin === true) {
      console.log(`✅ User has admin access`);
    } else {
      console.log(`❌ User does not have admin access`);
      console.log(`💡 To add admin access, run:`);
      console.log(`   node scripts/manage-admin-users.js add ${email}`);
    }
    
  } catch (error) {
    console.error(`❌ Error checking user ${email}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/check-current-user-permissions.js <email>');
    console.log('Example: node scripts/check-current-user-permissions.js roscoeevans@gmail.com');
    process.exit(1);
  }
  
  const email = args[0];
  await checkUserPermissions(email);
}

main().catch(console.error); 