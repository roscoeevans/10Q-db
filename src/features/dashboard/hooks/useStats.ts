import { useState, useEffect, useCallback } from 'react';
import { statsService } from '../services/statsService';
import type { DashboardStats, AnalyticsData } from '../types';
import { errorHandler, getErrorMessage } from '../../../lib/errors';

interface UseStatsState {
  dashboardStats: DashboardStats | null;
  analyticsData: AnalyticsData | null;
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'edit' | 'delete';
    description: string;
    timestamp: string;
  }>;
  loading: boolean;
  error: string | null;
}

interface UseStatsReturn extends UseStatsState {
  refreshStats: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  clearError: () => void;
}

export function useStats(): UseStatsReturn {
  const [state, setState] = useState<UseStatsState>({
    dashboardStats: null,
    analyticsData: null,
    recentActivity: [],
    loading: true,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardStats = await statsService.getDashboardStats();

      setState(prev => ({
        ...prev,
        dashboardStats,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
    }
  }, [setLoading, setError]);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await statsService.getAnalyticsData();

      setState(prev => ({
        ...prev,
        analyticsData,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
    }
  }, [setLoading, setError]);

  const refreshActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const recentActivity = await statsService.getRecentActivity();

      setState(prev => ({
        ...prev,
        recentActivity,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
    }
  }, [setLoading, setError]);

  // Load all stats on mount
  useEffect(() => {
    const loadAllStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardStats, analyticsData, recentActivity] = await Promise.all([
          statsService.getDashboardStats(),
          statsService.getAnalyticsData(),
          statsService.getRecentActivity(),
        ]);

        setState(prev => ({
          ...prev,
          dashboardStats,
          analyticsData,
          recentActivity,
          loading: false,
          error: null,
        }));
      } catch (error) {
        const message = getErrorMessage(error as Error);
        setError(message);
        errorHandler.handle(error as Error);
      }
    };

    loadAllStats();
  }, [setLoading, setError]);

  return {
    ...state,
    refreshStats,
    refreshAnalytics,
    refreshActivity,
    clearError,
  };
} 