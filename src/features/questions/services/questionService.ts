import { getAllQuestions as getAllQuestionsAdmin, getQuestionStatistics as getQuestionStatisticsAdmin } from '../../../lib/firestore-admin';
import type { FirestoreQuestion } from '../../../types/questions';
import type { 
  QuestionService as IQuestionService, 
  CreateQuestionData, 
  QuestionSearchQuery,
  QuestionStats 
} from '../types';
import { DatabaseError, NotFoundError, ValidationError } from '../../../lib/errors';

export class QuestionService implements IQuestionService {
  private static instance: QuestionService;

  private constructor() {}

  static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  async getAllQuestions(): Promise<FirestoreQuestion[]> {
    try {
      const adminQuestions = await getAllQuestionsAdmin();
      
      // Convert AdminFirestoreQuestion to FirestoreQuestion
      return adminQuestions.map(q => ({
        id: q.id,
        question: q.question,
        choices: q.choices,
        correctAnswer: 0, // Admin questions always have correct answer at index 0
        difficulty: q.difficulty,
        tags: q.tags,
        date: q.date,
        theme: '', // Not available in admin questions
        createdAt: new Date().toISOString(), // Fallback
        updatedAt: new Date().toISOString()  // Fallback
      }));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getQuestionById(id: string): Promise<FirestoreQuestion | null> {
    try {
      const questions = await this.getAllQuestions();
      return questions.find(q => q.id === id) || null;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch question ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createQuestion(questionData: CreateQuestionData): Promise<FirestoreQuestion> {
    try {
      // Validate question data
      this.validateQuestionData(questionData);

      // Convert difficulty string to number
      const difficultyMap = { easy: 1, medium: 2, hard: 3 };
      const difficultyNumber = difficultyMap[questionData.difficulty];

      // TODO: Implement actual question creation in Firestore
      // For now, we'll simulate creation
      const newQuestion: FirestoreQuestion = {
        id: `temp-${Date.now()}`,
        question: questionData.question,
        choices: questionData.choices,
        correctAnswer: questionData.correctAnswer,
        difficulty: difficultyNumber,
        tags: questionData.tags,
        date: questionData.date,
        theme: questionData.theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return newQuestion;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateQuestion(id: string, updates: Partial<FirestoreQuestion>): Promise<FirestoreQuestion> {
    try {
      const existingQuestion = await this.getQuestionById(id);
      if (!existingQuestion) {
        throw new NotFoundError(`Question with id ${id}`);
      }

      // TODO: Implement actual question update in Firestore
      const updatedQuestion: FirestoreQuestion = {
        ...existingQuestion,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return updatedQuestion;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update question ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      const existingQuestion = await this.getQuestionById(id);
      if (!existingQuestion) {
        throw new NotFoundError(`Question with id ${id}`);
      }

      // TODO: Implement actual question deletion in Firestore
      console.log(`Deleting question ${id}`);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete question ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchQuestions(query: QuestionSearchQuery): Promise<FirestoreQuestion[]> {
    try {
      let questions = await this.getAllQuestions();

      // Apply search filters
      if (query.searchTerm) {
        const searchTerm = query.searchTerm.toLowerCase();
        questions = questions.filter(q => 
          q.question.toLowerCase().includes(searchTerm) ||
          q.choices.some(choice => choice.toLowerCase().includes(searchTerm)) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (query.difficulty) {
        questions = questions.filter(q => q.difficulty === query.difficulty);
      }

      if (query.tags && query.tags.length > 0) {
        questions = questions.filter(q => 
          query.tags!.some(tag => q.tags.includes(tag))
        );
      }

      if (query.dateFrom) {
        questions = questions.filter(q => q.date >= query.dateFrom!);
      }

      if (query.dateTo) {
        questions = questions.filter(q => q.date <= query.dateTo!);
      }

      // Apply pagination
      if (query.offset) {
        questions = questions.slice(query.offset);
      }

      if (query.limit) {
        questions = questions.slice(0, query.limit);
      }

      return questions;
    } catch (error) {
      throw new DatabaseError(`Failed to search questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getQuestionStatistics(): Promise<QuestionStats> {
    try {
      const stats = await getQuestionStatisticsAdmin();
      const questions = await this.getAllQuestions();

      // Calculate additional statistics
      const byDifficulty = {
        easy: questions.filter(q => q.difficulty === 'easy').length,
        medium: questions.filter(q => q.difficulty === 'medium').length,
        hard: questions.filter(q => q.difficulty === 'hard').length,
      };

      // Group by month
      const byMonth = this.groupQuestionsByMonth(questions);

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = this.groupQuestionsByDate(
        questions.filter(q => new Date(q.createdAt) >= thirtyDaysAgo)
      );

      return {
        totalQuestions: stats.totalQuestions,
        byDifficulty,
        byMonth,
        recentActivity
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch question statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateQuestionData(data: CreateQuestionData): void {
    const errors: string[] = [];

    if (!data.question || data.question.trim().length === 0) {
      errors.push('Question text is required');
    }

    if (!data.choices || data.choices.length < 2) {
      errors.push('At least 2 choices are required');
    }

    if (data.correctAnswer < 0 || data.correctAnswer >= data.choices.length) {
      errors.push('Correct answer index is invalid');
    }

    if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
      errors.push('Invalid difficulty level');
    }

    if (!data.date) {
      errors.push('Date is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  private groupQuestionsByMonth(questions: FirestoreQuestion[]): Array<{ month: string; count: number }> {
    const monthMap = new Map<string, number>();
    
    questions.forEach(q => {
      const date = new Date(q.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    return Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private groupQuestionsByDate(questions: FirestoreQuestion[]): Array<{ date: string; count: number }> {
    const dateMap = new Map<string, number>();
    
    questions.forEach(q => {
      const date = new Date(q.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

// Export singleton instance
export const questionService = QuestionService.getInstance(); 