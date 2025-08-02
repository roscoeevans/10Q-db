// Firebase Admin SDK - Mock exports for browser environment
// The real Admin SDK should only be used in server-side scripts

console.warn('⚠️  Firebase Admin SDK is server-side only - using mock exports');

// Mock exports for browser environment
export const adminDb = null as any;
export const testAdminConnection = async () => false;
export const isUsingRealServiceAccount = () => false;

console.log('🔧 Firebase Admin SDK disabled in browser environment');
console.log('   Use scripts/manage-admin-users.js for server-side admin operations'); 