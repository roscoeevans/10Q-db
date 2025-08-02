import { getQuestionStatistics as getQuestionStatisticsAdmin } from '../../../lib/firestore-admin';
import type { DashboardStats, AnalyticsData } from '../types';
import { DatabaseError } from '../../../lib/errors';

export class StatsService {
  private static instance: StatsService;

  private constructor() {}

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const stats = await getQuestionStatisticsAdmin();
      
      // Calculate additional statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // For now, we'll use the basic stats and calculate some derived values
      // In a real implementation, you'd query the database for these specific metrics
      const questionsThisMonth = Math.floor(stats.totalQuestions * 0.3); // Simulated
      const questionsThisWeek = Math.floor(stats.totalQuestions * 0.1); // Simulated
      const averageQuestionsPerDay = Math.round(stats.totalQuestions / 30); // Simulated
      
      const difficultyDistribution = {
        easy: Math.floor(stats.totalQuestions * 0.4),
        medium: Math.floor(stats.totalQuestions * 0.4),
        hard: Math.floor(stats.totalQuestions * 0.2),
      };

      const recentActivity = this.generateRecentActivity(stats.totalQuestions);
      const topTags = this.generateTopTags();

      return {
        totalQuestions: stats.totalQuestions,
        questionsThisMonth,
        questionsThisWeek,
        averageQuestionsPerDay,
        mostActiveDay: 'Monday', // Simulated
        difficultyDistribution,
        recentActivity,
        topTags,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // Simulated analytics data
      // In a real implementation, this would come from Google Analytics, Mixpanel, etc.
      return {
        pageViews: 1250,
        uniqueVisitors: 450,
        averageSessionDuration: 180, // seconds
        bounceRate: 0.35, // 35%
        topPages: [
          { page: '/upload', views: 320 },
          { page: '/explore', views: 280 },
          { page: '/home', views: 250 },
          { page: '/settings', views: 120 },
        ],
        userEngagement: {
          uploads: 45,
          searches: 180,
          downloads: 90,
        },
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecentActivity(): Promise<Array<{
    id: string;
    type: 'upload' | 'edit' | 'delete';
    description: string;
    timestamp: string;
  }>> {
    try {
      // Simulated recent activity
      // In a real implementation, this would come from an activity log
      const activities = [
        {
          id: '1',
          type: 'upload' as const,
          description: 'Uploaded 5 new questions for "JavaScript Fundamentals"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: '2',
          type: 'edit' as const,
          description: 'Updated question difficulty from "easy" to "medium"',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        },
        {
          id: '3',
          type: 'upload' as const,
          description: 'Uploaded 3 new questions for "React Hooks"',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          id: '4',
          type: 'delete' as const,
          description: 'Deleted duplicate question about "Array methods"',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        },
        {
          id: '5',
          type: 'upload' as const,
          description: 'Uploaded 7 new questions for "CSS Grid"',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        },
      ];

      return activities;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateRecentActivity(totalQuestions: number): Array<{ date: string; count: number }> {
    const activity = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const count = Math.floor(Math.random() * 10) + 1; // Random count between 1-10
      activity.push({ date: dateString, count });
    }
    
    return activity;
  }

  private generateTopTags(): Array<{ tag: string; count: number }> {
    const tags = [
      { tag: 'JavaScript', count: 45 },
      { tag: 'React', count: 32 },
      { tag: 'CSS', count: 28 },
      { tag: 'HTML', count: 25 },
      { tag: 'TypeScript', count: 20 },
      { tag: 'Node.js', count: 18 },
      { tag: 'Python', count: 15 },
      { tag: 'SQL', count: 12 },
    ];
    
    return tags.sort((a, b) => b.count - a.count);
  }
}

// Export singleton instance
export const statsService = StatsService.getInstance(); 