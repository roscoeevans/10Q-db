import { Upload } from 'lucide-react';
import type { FirestoreQuestion } from '../types/questions';
import type { QuestionStats } from '../features/questions/types';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { useStats } from '../features/dashboard';
import { Spinner } from '../components/ui';

interface HomePageProps {
  stats: QuestionStats | null;
  questions: FirestoreQuestion[];
  onNavigateToUpload: () => void;
}

const HomePage = ({ stats, questions, onNavigateToUpload }: HomePageProps) => {
  const { dashboardStats, recentActivity, loading: statsLoading } = useStats();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          10Q Database
        </h1>
        <p className="text-gray-400">
          Upload and manage your daily question sets with AI-powered generation
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Questions"
            value={dashboardStats.totalQuestions}
            icon={
              <svg className="w-6 h-6 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            variant="primary"
          />
          <StatsCard
            title="This Month"
            value={dashboardStats.questionsThisMonth}
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            variant="success"
          />
          <StatsCard
            title="This Week"
            value={dashboardStats.questionsThisWeek}
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            variant="warning"
          />
          <StatsCard
            title="Avg Per Day"
            value={dashboardStats.averageQuestionsPerDay}
            icon={
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            variant="default"
          />
        </div>
      )}

      {/* Difficulty Distribution */}
      {dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Difficulty Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Easy</span>
                <span className="text-white font-semibold">{dashboardStats.difficultyDistribution.easy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Medium</span>
                <span className="text-white font-semibold">{dashboardStats.difficultyDistribution.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Hard</span>
                <span className="text-white font-semibold">{dashboardStats.difficultyDistribution.hard}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} maxItems={3} />
        </div>
      )}

      {/* Quick Upload CTA */}
      <div className="glass-card p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-ios-blue mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ready to Create a Quiz?</h2>
          <p className="text-gray-400 mb-4">
            Use AI to generate a 10-question quiz set for any date
          </p>
          <button
            onClick={onNavigateToUpload}
            className="ios-button flex items-center gap-2 mx-auto"
          >
            <Upload className="w-4 h-4" />
            Start Creating
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 