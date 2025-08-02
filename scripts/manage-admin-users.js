#!/usr/bin/env node

/**
 * 🔐 Admin User Management Script for 10Q-DB
 * 
 * This script helps manage admin users by setting custom claims.
 * It allows you to assign the admin: true claim to specific users.
 * 
 * Usage:
 *   node scripts/manage-admin-users.js add <email>
 *   node scripts/manage-admin-users.js remove <email>
 *   node scripts/manage-admin-users.js list
 *   node scripts/manage-admin-users.js check <email>
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

async function addAdminUser(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.uid})`);
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ Set admin: true claim for ${email}`);
    
    // Verify the claim was set
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log(`📋 User claims:`, updatedUser.customClaims);
    
  } catch (error) {
    console.error(`❌ Error adding admin user ${email}:`, error.message);
    process.exit(1);
  }
}

async function removeAdminUser(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.uid})`);
    
    // Remove admin claim
    await auth.setCustomUserClaims(userRecord.uid, { admin: false });
    console.log(`✅ Removed admin claim for ${email}`);
    
    // Verify the claim was removed
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log(`📋 User claims:`, updatedUser.customClaims);
    
  } catch (error) {
    console.error(`❌ Error removing admin user ${email}:`, error.message);
    process.exit(1);
  }
}

async function checkUserClaims(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || 'No name'} (${userRecord.uid})`);
    
    console.log(`📋 User claims:`, userRecord.customClaims);
    
    if (userRecord.customClaims && userRecord.customClaims.admin === true) {
      console.log(`✅ User ${email} has admin access`);
    } else {
      console.log(`❌ User ${email} does NOT have admin access`);
    }
    
  } catch (error) {
    console.error(`❌ Error checking user ${email}:`, error.message);
    process.exit(1);
  }
}

async function listAdminUsers() {
  try {
    console.log('🔍 Listing all users with admin claims...');
    
    // List all users (this is paginated, so we'll get the first batch)
    const listUsersResult = await auth.listUsers();
    
    const adminUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.admin === true
    );
    
    if (adminUsers.length === 0) {
      console.log('📋 No users with admin claims found');
    } else {
      console.log(`📋 Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.displayName || 'No name'})`);
        console.log(`     UID: ${user.uid}`);
        console.log(`     Claims:`, user.customClaims);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
    process.exit(1);
  }
}

// Main script logic
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];
  
  console.log('🔐 10Q-DB Admin User Management Script');
  console.log('=====================================\n');
  
  switch (command) {
    case 'add':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.error('   Usage: node scripts/manage-admin-users.js add <email>');
        process.exit(1);
      }
      await addAdminUser(email);
      break;
      
    case 'remove':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.error('   Usage: node scripts/manage-admin-users.js remove <email>');
        process.exit(1);
      }
      await removeAdminUser(email);
      break;
      
    case 'check':
      if (!email) {
        console.error('❌ Please provide an email address');
        console.error('   Usage: node scripts/manage-admin-users.js check <email>');
        process.exit(1);
      }
      await checkUserClaims(email);
      break;
      
    case 'list':
      await listAdminUsers();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/manage-admin-users.js add <email>     - Add admin access');
      console.log('  node scripts/manage-admin-users.js remove <email>  - Remove admin access');
      console.log('  node scripts/manage-admin-users.js check <email>   - Check user claims');
      console.log('  node scripts/manage-admin-users.js list            - List all admin users');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/manage-admin-users.js add roscoeevans@gmail.com');
      console.log('  node scripts/manage-admin-users.js check roscoeevans@gmail.com');
      console.log('  node scripts/manage-admin-users.js list');
      break;
  }
  
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 