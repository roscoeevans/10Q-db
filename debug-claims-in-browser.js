// Debug script to run in browser console
// Copy and paste this into your browser's developer console while signed in

console.log('🔍 Debugging user claims in browser...');

// Get the auth instance
const auth = window.firebase?.auth?.() || window.auth;

if (!auth || !auth.currentUser) {
  console.log('❌ No user authenticated');
  console.log('Please sign in first, then run this script');
} else {
  const user = auth.currentUser;
  console.log('✅ User authenticated:', user.email);
  console.log('UID:', user.uid);
  
  // Force refresh token and get claims
  user.getIdToken(true)
    .then(() => user.getIdTokenResult())
    .then((idTokenResult) => {
      console.log('📋 ID Token Claims:', idTokenResult.claims);
      console.log('Auth Time:', new Date(idTokenResult.authTime).toISOString());
      console.log('Issued At:', new Date(idTokenResult.issuedAtTime).toISOString());
      console.log('Expiration:', new Date(idTokenResult.expirationTime).toISOString());
      
      if (idTokenResult.claims.admin === true) {
        console.log('✅ User has admin claim');
      } else {
        console.log('❌ User does NOT have admin claim');
        console.log('💡 This is why uploads are failing');
      }
      
      // Test a simple write
      const db = window.firebase?.firestore?.() || window.db;
      if (db) {
        const testRef = db.collection('questions').doc(`browser-test-${Date.now()}`);
        testRef.set({
          id: testRef.id,
          question: 'Browser test question',
          choices: ['A', 'B', 'C', 'D'],
          answer: 'A',
          date: 'test',
          difficulty: 1,
          lastUsed: '',
          tags: ['test', 'browser']
        })
        .then(() => {
          console.log('✅ Browser write test PASSED');
          return testRef.delete();
        })
        .then(() => {
          console.log('✅ Test document cleaned up');
        })
        .catch((error) => {
          console.error('❌ Browser write test FAILED:', error.message);
          console.error('Error code:', error.code);
        });
      } else {
        console.log('❌ Could not access Firestore instance');
      }
    })
    .catch((error) => {
      console.error('❌ Error getting token:', error);
    });
} 