import { useAuth } from '../../features/auth';

export default function UserInfo() {
  const { user, hasPermission, permissionLoading } = useAuth();

  if (!user) {
    return (
      <div className="glass-card p-4 mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">🔍 Current User Info</h3>
        <p className="text-gray-400">No user authenticated</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-2">🔍 Current User Info</h3>
      <div className="space-y-1 text-sm">
        <p><span className="text-gray-400">UID:</span> <span className="text-white font-mono">{user.uid}</span></p>
        <p><span className="text-gray-400">Email:</span> <span className="text-white">{user.email}</span></p>
        <p><span className="text-gray-400">Display Name:</span> <span className="text-white">{user.displayName || 'N/A'}</span></p>
        <p><span className="text-gray-400">Permission Status:</span> 
          <span className={`ml-2 ${hasPermission ? 'text-green-400' : 'text-red-400'}`}>
            {permissionLoading ? 'Checking...' : (hasPermission ? '✅ Granted' : '❌ Denied')}
          </span>
        </p>
      </div>
    </div>
  );
} 