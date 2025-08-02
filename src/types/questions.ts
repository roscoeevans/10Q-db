// Question-related type definitions

export interface FirestoreQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  difficulty: number;
  tags: string[];
  date: string;
  theme: string;
  createdAt: any;
  updatedAt: any;
}

// This interface matches what generateQuestionsWithAI returns from firestore.ts
export interface GeneratedQuestion {
  question: string;
  choices: string[];
  answer: string;
  date: string;
  tags: string[];
  isCorrectAnswerFirst: boolean;
}

export interface SetupData {
  targetDate: string;
  theme: string;
}

export type Step = 1 | 2 | 3 | 'uploading' | 'success' | 'error';

export interface DateStatus {
  available: boolean;
  questionCount: number;
}

export interface QuestionStatistics {
  totalQuestions: number;
  averageDifficulty: number;
  latestSet: string;
} 