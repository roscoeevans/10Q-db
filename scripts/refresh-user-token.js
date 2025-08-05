import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccountPath = join(__dirname, '../secrets/serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'q-production-e4848'
  });
}

async function refreshUserToken(email) {
  try {
    console.log(`🔄 Refreshing token for user: ${email}`);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName} (${userRecord.uid})`);
    
    // Check current claims
    const currentClaims = userRecord.customClaims || {};
    console.log('📋 Current claims:', currentClaims);
    
    // Set admin claim if not already set
    if (!currentClaims.admin) {
      console.log('🔧 Setting admin claim...');
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('✅ Admin claim set successfully');
    } else {
      console.log('✅ Admin claim already exists');
    }
    
    // Force token refresh by updating user
    await admin.auth().updateUser(userRecord.uid, {
      customClaims: { admin: true }
    });
    
    console.log('✅ User token should be refreshed');
    console.log('💡 The user may need to sign out and sign back in to get the new token');
    
  } catch (error) {
    console.error('❌ Error refreshing user token:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/refresh-user-token.js <email>');
  process.exit(1);
}

refreshUserToken(email).then(() => {
  console.log('🎉 Token refresh process complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 