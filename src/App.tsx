import { useState } from 'react';
import type { Tab } from './types/common';
import LoginScreen from './components/auth/LoginScreen';
import PermissionDeniedScreen from './components/auth/PermissionDeniedScreen';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './features/auth';
import { useQuestions } from './features/questions';
import { ErrorBoundary } from './lib/errors';

function App() {
  const { user, loading: authLoading, hasPermission, permissionLoading, signOut } = useAuth();
  const { questions, stats, loading: questionsLoading, error: questionsError } = useQuestions();
  const [activeTab, setActiveTab] = useState<Tab>('upload'); // Default to upload tab

  // Firebase is configured and ready

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            stats={stats} 
            questions={questions} 
            onNavigateToUpload={() => setActiveTab('upload')} 
          />
        );
      case 'upload':
        return <UploadPage />;
      case 'explore':
        return <ExplorePage questions={questions} loading={questionsLoading} />;
      case 'settings':
        return <SettingsPage user={user} onSignOut={signOut} />;
      default:
        return (
          <HomePage 
            stats={stats} 
            questions={questions} 
            onNavigateToUpload={() => setActiveTab('upload')} 
          />
        );
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show permission denied screen if user doesn't have permission
  if (permissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-white">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return <PermissionDeniedScreen />;
  }

  // Show error if questions failed to load
  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Data</h2>
          <p className="text-gray-400 mb-4">{questionsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-ios-blue text-white px-4 py-2 rounded-lg hover:bg-ios-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="mt-8">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;