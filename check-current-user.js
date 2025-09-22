// Simple script to check current user information
import { auth } from './src/lib/firebase.js';

console.log('🔍 Checking current user information...');

// Check if user is authenticated
if (auth.currentUser) {
  const user = auth.currentUser;
  console.log('✅ User is authenticated:');
  console.log('  UID:', user.uid);
  console.log('  Email:', user.email);
  console.log('  Display Name:', user.displayName);
  console.log('  Photo URL:', user.photoURL);
  console.log('  Email Verified:', user.emailVerified);
  console.log('  Creation Time:', user.metadata.creationTime);
  console.log('  Last Sign In:', user.metadata.lastSignInTime);
  
  // Get ID token to check custom claims
  user.getIdTokenResult()
    .then((idTokenResult) => {
      console.log('  Custom Claims:', idTokenResult.claims);
      console.log('  Admin Claim:', idTokenResult.claims.admin);
    })
    .catch((error) => {
      console.error('❌ Error getting ID token:', error);
    });
} else {
  console.log('❌ No user is currently authenticated');
} 