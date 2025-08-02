import type { FirestoreQuestion } from '../../types/questions';

// Question service types
export interface QuestionService {
  getAllQuestions(): Promise<FirestoreQuestion[]>;
  getQuestionById(id: string): Promise<FirestoreQuestion | null>;
  createQuestion(question: CreateQuestionData): Promise<FirestoreQuestion>;
  updateQuestion(id: string, updates: Partial<FirestoreQuestion>): Promise<FirestoreQuestion>;
  deleteQuestion(id: string): Promise<void>;
  searchQuestions(query: QuestionSearchQuery): Promise<FirestoreQuestion[]>;
}

// Question creation data
export interface CreateQuestionData {
  question: string;
  choices: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  date: string;
  theme: string;
}

// Question search query
export interface QuestionSearchQuery {
  searchTerm?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Question generation request
export interface QuestionGenerationRequest {
  date: string;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count?: number;
}

// Question generation response
export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  metadata: {
    generatedAt: string;
    model: string;
    tokensUsed: number;
  };
}

// Generated question structure
export interface GeneratedQuestion {
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation?: string;
}

// Question upload state
export interface QuestionUploadState {
  isUploading: boolean;
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  error?: string;
}

// Question validation result
export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Question statistics
export interface QuestionStats {
  totalQuestions: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  byMonth: Array<{
    month: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
} 