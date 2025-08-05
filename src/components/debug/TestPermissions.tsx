import React, { useState } from 'react';
import { useAuth } from '../../features/auth';
import { auth } from '../../lib/firebase';

export default function TestPermissions() {
  const { user, hasPermission, permissionLoading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTokenClaims = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdTokenResult();
      setTokenInfo({
        uid: token.claims.user_id || token.claims.sub,
        email: token.claims.email,
        admin: token.claims.admin,
        allClaims: token.claims
      });
    } catch (error) {
      console.error('Error getting token claims:', error);
      setTokenInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const forceTokenRefresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Force token refresh
      await user.getIdToken(true);
      alert('✅ Token refreshed! Check claims again.');
    } catch (error) {
      console.error('Error refreshing token:', error);
      alert(`❌ Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreWrite = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const testDoc = doc(db, 'questions', 'test-permission-check');
      await setDoc(testDoc, {
        test: true,
        timestamp: new Date().toISOString(),
        userId: user.uid
      });
      
      alert('✅ Firestore write test successful!');
    } catch (error) {
      console.error('Firestore write test failed:', error);
      alert(`❌ Firestore write test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-4 mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">🔐 Permission Test</h3>
        <p className="text-gray-400">No user authenticated</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-2">🔐 Permission Test</h3>
      
      <div className="space-y-4">
        {/* Current User Info */}
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-400">UID:</span> <span className="text-white font-mono">{user.uid}</span></p>
          <p><span className="text-gray-400">Email:</span> <span className="text-white">{user.email}</span></p>
          <p><span className="text-gray-400">Permission Status:</span> 
            <span className={`ml-2 ${hasPermission ? 'text-green-400' : 'text-red-400'}`}>
              {permissionLoading ? 'Checking...' : (hasPermission ? '✅ Granted' : '❌ Denied')}
            </span>
          </p>
        </div>

        {/* Token Claims */}
        <div className="space-y-2">
          <button 
            onClick={checkTokenClaims}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Checking...' : 'Check Token Claims'}
          </button>
          
          <button 
            onClick={forceTokenRefresh}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Refreshing...' : 'Force Token Refresh'}
          </button>
          
          {tokenInfo && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
              <pre className="text-white overflow-auto">
                {JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Firestore Write Test */}
        <div>
          <button 
            onClick={testFirestoreWrite}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Testing...' : 'Test Firestore Write'}
          </button>
        </div>
      </div>
    </div>
  );
} 