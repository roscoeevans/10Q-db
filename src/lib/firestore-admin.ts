import { collection, doc, getDocs, query, orderBy, where, limit, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// Types (re-exported from the original firestore.ts)
export interface FirestoreQuestion {
  id: string;
  question: string;
  choices: string[]; // NOTE: Correct answer is ALWAYS at index 0
  answer: string;    // Must match choices[0]
  date: string;
  difficulty: number; // 1-10 scale: 1=easy, 10=expert (based on question position)
  lastUsed: string;
  tags: string[];
}

export interface QuestionUpload {
  question: string;
  choices: string[]; // NOTE: Correct answer is ALWAYS at index 0
  answer: string;    // Must match choices[0]
  date: string;
  tags: string[];
}

export interface QuestionStats {
  totalQuestions: number;
  averageDifficulty: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
  };
}

// Client-side Firestore operations (uses security rules)
export class ClientFirestoreService {
  private static instance: ClientFirestoreService;

  private constructor() {
    console.log('✅ Client Firestore service initialized');
  }

  static getInstance(): ClientFirestoreService {
    if (!ClientFirestoreService.instance) {
      ClientFirestoreService.instance = new ClientFirestoreService();
    }
    return ClientFirestoreService.instance;
  }

  // Upload daily questions (requires proper security rules)
  async uploadDailyQuestions(
    questions: QuestionUpload[], 
    targetDate: string
  ): Promise<string> {
    try {
      // Validate we have exactly 10 questions
      if (questions.length !== 10) {
        throw new Error(`Expected 10 questions, got ${questions.length}`);
      }

      const batch = writeBatch(db);
      
      // Process each question
      questions.forEach((questionData, index) => {
        const questionId = `${targetDate}-q${index}`;
        
        // Create the question document
        const questionDocRef = doc(db, 'questions', questionId);
        const firestoreQuestion = {
          id: questionId,
          question: questionData.question,
          choices: questionData.choices,
          answer: questionData.answer,
          date: targetDate,
          difficulty: index + 1, // Questions 1-10 based on position (1=easy, 10=expert)
          lastUsed: "", // Empty for new questions
          tags: questionData.tags
        };
        
        batch.set(questionDocRef, firestoreQuestion);
        
        // Add to tag subcollections
        questionData.tags.forEach(tag => {
          const tagQuestionsRef = doc(db, 'tags', tag, 'questions', questionId);
          batch.set(tagQuestionsRef, { questionId });
        });
      });
      
      await batch.commit();
      console.log(`✅ Successfully uploaded ${questions.length} questions for ${targetDate} using client SDK`);
      return `Successfully uploaded ${questions.length} questions for ${targetDate}`;
    } catch (error) {
      console.error("❌ Error uploading questions with client SDK:", error);
      throw error;
    }
  }

  // Get all questions (requires read permission)
  async getAllQuestions(): Promise<FirestoreQuestion[]> {
    try {
      console.log('🔍 Fetching all questions with client SDK...');
      
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log(`✅ Found ${snapshot.docs.length} questions using client SDK`);
      return snapshot.docs.map(doc => doc.data() as FirestoreQuestion);
    } catch (error) {
      console.error('❌ Error fetching all questions with client SDK:', error);
      throw error;
    }
  }

  // Get questions by date (requires read permission)
  async getQuestionsByDate(date: string): Promise<FirestoreQuestion[]> {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => doc.data() as FirestoreQuestion);
    } catch (error) {
      console.error('❌ Error fetching questions by date with client SDK:', error);
      throw error;
    }
  }

  // Check date availability (requires read permission)
  async checkDateAvailability(date: string): Promise<{ available: boolean; questionCount: number }> {
    try {
      const questions = await this.getQuestionsByDate(date);
      return {
        available: questions.length < 10,
        questionCount: questions.length
      };
    } catch (error) {
      console.error('❌ Error checking date availability with client SDK:', error);
      return {
        available: false,
        questionCount: 0
      };
    }
  }

  // Get question statistics (requires read permission)
  async getQuestionStatistics(): Promise<QuestionStats> {
    try {
      const questions = await this.getAllQuestions();
      
      const difficulties = questions.map(q => q.difficulty);
      const averageDifficulty = difficulties.length > 0 
        ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length 
        : 0;
      
      const distribution = {
        easy: difficulties.filter(d => d <= 25).length,
        medium: difficulties.filter(d => d > 25 && d <= 50).length,
        hard: difficulties.filter(d => d > 50 && d <= 75).length,
        expert: difficulties.filter(d => d > 75).length
      };
      
      return {
        totalQuestions: questions.length,
        averageDifficulty: Math.round(averageDifficulty * 10) / 10,
        difficultyDistribution: distribution
      };
    } catch (error) {
      console.error('❌ Error getting question statistics with client SDK:', error);
      throw error;
    }
  }

  // Get available tags (requires read permission)
  async getAvailableTags(): Promise<string[]> {
    try {
      const tagsRef = collection(db, 'tags');
      const snapshot = await getDocs(tagsRef);
      
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('❌ Error getting available tags with client SDK:', error);
      throw error;
    }
  }

  // Search questions (requires read permission)
  async searchQuestions(
    searchTerm: string,
    filters?: {
      tags?: string[];
      dateRange?: { start: string; end: string };
      difficultyRange?: { min: number; max: number };
    }
  ): Promise<FirestoreQuestion[]> {
    try {
      let questions = await this.getAllQuestions();
      
      // Text search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        questions = questions.filter(q => 
          q.question.toLowerCase().includes(term) ||
          q.answer.toLowerCase().includes(term) ||
          q.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
      
      // Apply filters
      if (filters?.tags?.length) {
        questions = questions.filter(q => 
          filters.tags!.some(tag => q.tags.includes(tag))
        );
      }
      
      if (filters?.dateRange) {
        questions = questions.filter(q => 
          q.date >= filters.dateRange!.start && q.date <= filters.dateRange!.end
        );
      }
      
      if (filters?.difficultyRange) {
        questions = questions.filter(q => 
          q.difficulty >= filters.difficultyRange!.min && 
          q.difficulty <= filters.difficultyRange!.max
        );
      }
      
      return questions;
    } catch (error) {
      console.error('❌ Error searching questions with client SDK:', error);
      throw error;
    }
  }

  // Find next available date (requires read permission)
  async findNextAvailableDate(startDate?: Date): Promise<string> {
    try {
      const start = startDate || new Date();
      let checkDate = new Date(start);
      
      // Check the next 365 days for availability
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        
        const { available } = await this.checkDateAvailability(dateStr);
        if (available) {
          return dateStr;
        }
        
        checkDate.setDate(checkDate.getDate() + 1);
      }
      
      // If no available date found, return today's date
      return start.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
    } catch (error) {
      console.error('❌ Error finding next available date with client SDK:', error);
      // Fallback to today's date if there's an error
      const today = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
      return today;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to read from questions collection to test connection
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, limit(1));
      await getDocs(q);
      return true;
    } catch (error) {
      console.error('❌ Client Firestore connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const clientFirestoreService = ClientFirestoreService.getInstance();

// Convenience functions that use the client service
export const uploadDailyQuestions = (questions: QuestionUpload[], targetDate: string) => 
  clientFirestoreService.uploadDailyQuestions(questions, targetDate);

export const getAllQuestions = () => clientFirestoreService.getAllQuestions();
export const getQuestionsByDate = (date: string) => clientFirestoreService.getQuestionsByDate(date);
export const checkDateAvailability = (date: string) => clientFirestoreService.checkDateAvailability(date);
export const findNextAvailableDate = (startDate?: Date) => clientFirestoreService.findNextAvailableDate(startDate);
export const getQuestionStatistics = () => clientFirestoreService.getQuestionStatistics();
export const getAvailableTags = () => clientFirestoreService.getAvailableTags();
export const searchQuestions = (searchTerm: string, filters?: any) => 
  clientFirestoreService.searchQuestions(searchTerm, filters); 