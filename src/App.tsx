import { useState, useEffect, useCallback } from 'react';
import { Brain, Database, Search, Settings, Home, Upload, LogOut, User } from 'lucide-react';
import { cn } from './lib/utils';
import { type FirestoreQuestion, getQuestionStatistics, getAllQuestions } from './lib/firestore-admin';
import { formatDate } from './lib/utils';
import QuestionUploadFlow from './components/QuestionUploadFlow';
import LoginScreen from './components/LoginScreen';
import PermissionDeniedScreen from './components/PermissionDeniedScreen';
import { useAuth } from './hooks/useAuth';

type Tab = 'home' | 'upload' | 'explore' | 'settings';

function App() {
  const { user, loading: authLoading, hasPermission, permissionLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('upload'); // Default to upload tab
  const [questions, setQuestions] = useState<FirestoreQuestion[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add some debugging for database connection
  useEffect(() => {
    console.log('Firebase config check - Project ID:', 'q-production-e4848');
    console.log('✅ Using client-side Firebase SDK for authentication and permissions');
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading data from Firestore...');
      const [questionsData, statsData] = await Promise.all([
        getAllQuestions(),
        getQuestionStatistics()
      ]);
      console.log('Loaded questions:', questionsData.length);
      console.log('First few questions:', questionsData.slice(0, 3));
      setQuestions(questionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Reset loading state when user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setQuestions([]);
      setStats(null);
    }
  }, [user]);

  const HomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-ios-gray-900 dark:text-ios-gray-100 mb-2">
          10Q Database
        </h1>
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Upload and manage your daily question sets with AI-powered generation
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-ios-blue">{stats.totalQuestions}</div>
            <div className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Total Questions</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-ios-green">{stats.averageDifficulty}%</div>
            <div className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Avg Difficulty</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-ios-purple">{questions.length > 0 ? questions[0].date : 'N/A'}</div>
            <div className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Latest Set</div>
          </div>
        </div>
      )}

      {/* Quick Upload CTA */}
      <div className="glass-card p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-ios-blue mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ready to Create a Quiz?</h2>
          <p className="text-ios-gray-600 dark:text-ios-gray-400 mb-4">
            Use AI to generate a 10-question quiz set for any date
          </p>
          <button
            onClick={() => setActiveTab('upload')}
            className="ios-button flex items-center gap-2 mx-auto"
          >
            <Brain className="w-4 h-4" />
            Start Upload Flow
          </button>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Questions</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto ios-scrollbar">
          {questions.slice(0, 10).map((question, index) => (
            <div key={question.id} className="ios-list-item">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-ios-gray-600 dark:text-ios-gray-400">
                  {formatDate(question.date)} - Q{index + 1}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  question.difficulty <= 25 ? "bg-ios-green/20 text-ios-green" :
                  question.difficulty <= 50 ? "bg-ios-yellow/20 text-ios-yellow" :
                  question.difficulty <= 75 ? "bg-ios-orange/20 text-ios-orange" :
                  "bg-ios-red/20 text-ios-red"
                )}>
                  {question.difficulty}%
                </span>
              </div>
              <p className="text-sm text-ios-gray-900 dark:text-ios-gray-100">
                {question.question}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {question.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="ios-badge text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UploadTab = () => (
    <QuestionUploadFlow />
  );

  const ExploreTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Explore Questions</h2>
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Browse and search through all questions in the database
        </p>
      </div>

      {/* Search and filters would go here */}
      <div className="glass-card p-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="ios-input w-full pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto ios-scrollbar">
          {questions.slice(0, 20).map((question, index) => (
            <div key={question.id} className="ios-list-item">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-ios-gray-600 dark:text-ios-gray-400">
                  {formatDate(question.date)} - Q{index + 1}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  question.difficulty <= 25 ? "bg-ios-green/20 text-ios-green" :
                  question.difficulty <= 50 ? "bg-ios-yellow/20 text-ios-yellow" :
                  question.difficulty <= 75 ? "bg-ios-orange/20 text-ios-orange" :
                  "bg-ios-red/20 text-ios-red"
                )}>
                  {question.difficulty}%
                </span>
              </div>
              <p className="text-sm text-ios-gray-900 dark:text-ios-gray-100">
                {question.question}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {question.tags.map(tag => (
                  <span key={tag} className="ios-badge text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Configure your 10Q Database preferences
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-4">Database Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-ios-gray-600 dark:text-ios-gray-400">Project ID</span>
            <span className="font-mono text-sm">q-production-e4848</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ios-gray-600 dark:text-ios-gray-400">Total Questions</span>
            <span>{stats?.totalQuestions || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ios-gray-600 dark:text-ios-gray-400">Average Difficulty</span>
            <span>{stats?.averageDifficulty || 0}%</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-4">Authentication Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-ios-gray-600 dark:text-ios-gray-400">User</span>
            <span className="font-medium text-ios-gray-900 dark:text-ios-gray-100">
              {user?.displayName || user?.email || 'Not signed in'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ios-gray-600 dark:text-ios-gray-400">Admin Access</span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              hasPermission 
                ? "bg-ios-green/20 text-ios-green" 
                : "bg-ios-red/20 text-ios-red"
            )}>
              {hasPermission ? 'GRANTED' : 'DENIED'}
            </span>
          </div>
          <div className="text-sm text-ios-gray-600 dark:text-ios-gray-400">
            <p>✅ Using Firebase client SDK for authentication and permissions.</p>
            <p className="mt-1">Admin access is controlled by custom claims and Firestore security rules.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'upload':
        return <UploadTab />;
      case 'explore':
        return <ExploreTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <HomeTab />;
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600 dark:text-ios-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show permission loading screen while checking permissions
  if (permissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600 dark:text-ios-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show permission denied screen if user doesn't have access
  if (!hasPermission) {
    return <PermissionDeniedScreen />;
  }

  // Show app loading screen while loading data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600 dark:text-ios-gray-400">Loading 10Q Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 to-ios-gray-100 dark:from-ios-gray-950 dark:to-ios-gray-900">
      {/* Navigation Bar */}
      <nav className="ios-navbar safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">10Q Database</h1>
            
            {/* User Info & Sign Out */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-ios-gray-600 dark:text-ios-gray-400">
                <User className="w-4 h-4" />
                <span>{user.displayName || user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1 text-sm text-ios-gray-600 dark:text-ios-gray-400 hover:text-ios-red transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {renderTabContent()}
      </main>

      {/* Tab Bar */}
      <div className="ios-tabbar safe-area-bottom">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-colors",
                activeTab === 'home' 
                  ? "text-ios-blue bg-ios-blue/10" 
                  : "text-ios-gray-600 dark:text-ios-gray-400"
              )}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-colors",
                activeTab === 'upload' 
                  ? "text-ios-blue bg-ios-blue/10" 
                  : "text-ios-gray-600 dark:text-ios-gray-400"
              )}
            >
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs">Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-colors",
                activeTab === 'explore' 
                  ? "text-ios-blue bg-ios-blue/10" 
                  : "text-ios-gray-600 dark:text-ios-gray-400"
              )}
            >
              <Database className="w-5 h-5 mb-1" />
              <span className="text-xs">Explore</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-colors",
                activeTab === 'settings' 
                  ? "text-ios-blue bg-ios-blue/10" 
                  : "text-ios-gray-600 dark:text-ios-gray-400"
              )}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
