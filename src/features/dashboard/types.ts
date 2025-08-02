// Dashboard statistics types
export interface DashboardStats {
  totalQuestions: number;
  questionsThisMonth: number;
  questionsThisWeek: number;
  averageQuestionsPerDay: number;
  mostActiveDay: string;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Analytics data types
export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  userEngagement: {
    uploads: number;
    searches: number;
    downloads: number;
  };
}

// Dashboard service interface
export interface DashboardService {
  getDashboardStats(): Promise<DashboardStats>;
  getAnalyticsData(): Promise<AnalyticsData>;
  getRecentActivity(): Promise<Array<{
    id: string;
    type: 'upload' | 'edit' | 'delete';
    description: string;
    timestamp: string;
  }>>;
} 