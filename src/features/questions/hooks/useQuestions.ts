import { useState, useEffect, useCallback } from 'react';
import { questionService } from '../services/questionService';
import type { FirestoreQuestion } from '../../../types/questions';
import type { QuestionSearchQuery, CreateQuestionData, QuestionStats } from '../types';
import { errorHandler, getErrorMessage } from '../../../lib/errors';

interface UseQuestionsState {
  questions: FirestoreQuestion[];
  stats: QuestionStats | null;
  loading: boolean;
  error: string | null;
}

interface UseQuestionsReturn extends UseQuestionsState {
  refreshQuestions: () => Promise<void>;
  searchQuestions: (query: QuestionSearchQuery) => Promise<FirestoreQuestion[]>;
  createQuestion: (data: CreateQuestionData) => Promise<FirestoreQuestion>;
  updateQuestion: (id: string, updates: Partial<FirestoreQuestion>) => Promise<FirestoreQuestion>;
  deleteQuestion: (id: string) => Promise<void>;
  getQuestionById: (id: string) => Promise<FirestoreQuestion | null>;
  clearError: () => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [state, setState] = useState<UseQuestionsState>({
    questions: [],
    stats: null,
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

  const refreshQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [questions, stats] = await Promise.all([
        questionService.getAllQuestions(),
        questionService.getQuestionStatistics()
      ]);

      setState(prev => ({
        ...prev,
        questions,
        stats,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
    }
  }, [setLoading, setError]);

  const searchQuestions = useCallback(async (query: QuestionSearchQuery): Promise<FirestoreQuestion[]> => {
    try {
      setLoading(true);
      const results = await questionService.searchQuestions(query);
      setLoading(false);
      return results;
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
      return [];
    }
  }, [setLoading, setError]);

  const createQuestion = useCallback(async (data: CreateQuestionData): Promise<FirestoreQuestion> => {
    try {
      setLoading(true);
      const newQuestion = await questionService.createQuestion(data);
      
      // Refresh the questions list to include the new question
      await refreshQuestions();
      
      return newQuestion;
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
      throw error;
    }
  }, [setLoading, setError, refreshQuestions]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<FirestoreQuestion>): Promise<FirestoreQuestion> => {
    try {
      setLoading(true);
      const updatedQuestion = await questionService.updateQuestion(id, updates);
      
      // Update the local state
      setState(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === id ? updatedQuestion : q
        ),
        loading: false,
      }));
      
      return updatedQuestion;
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
      throw error;
    }
  }, [setLoading, setError]);

  const deleteQuestion = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await questionService.deleteQuestion(id);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== id),
        loading: false,
      }));
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
      throw error;
    }
  }, [setLoading, setError]);

  const getQuestionById = useCallback(async (id: string): Promise<FirestoreQuestion | null> => {
    try {
      return await questionService.getQuestionById(id);
    } catch (error) {
      const message = getErrorMessage(error as Error);
      setError(message);
      errorHandler.handle(error as Error);
      return null;
    }
  }, [setError]);

  // Load questions on mount
  useEffect(() => {
    refreshQuestions();
  }, [refreshQuestions]);

  return {
    ...state,
    refreshQuestions,
    searchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    clearError,
  };
} 