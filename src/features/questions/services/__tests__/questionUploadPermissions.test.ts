import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadDailyQuestions } from '@/lib/firestore';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  writeBatch: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock the Firestore database
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: null,
  },
}));

// Mock the getQuestionsByDate function
vi.mock('@/lib/firestore', async () => {
  const actual = await vi.importActual('@/lib/firestore');
  return {
    ...actual,
    getQuestionsByDate: vi.fn(),
  };
});

describe('Question Upload Permissions', () => {
  let mockBatch: any;
  let mockAuth: any;
  let mockCurrentUser: any;

  const mockQuestions = Array.from({ length: 10 }, (_, index) => ({
    question: `Test question ${index + 1}?`,
    choices: [`Answer ${index + 1}`, `Wrong ${index + 1}A`, `Wrong ${index + 1}B`, `Wrong ${index + 1}C`],
    answer: `Answer ${index + 1}`,
    date: "2024-12-25",
    tags: [`category${index + 1}`, `subcategory${index + 1}`, `specific${index + 1}`]
  }));

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock batch operations
    mockBatch = {
      set: vi.fn(),
      commit: vi.fn(),
    };
    vi.mocked(writeBatch).mockReturnValue(mockBatch);

    // Mock document references
    vi.mocked(doc).mockReturnValue({} as any);
    vi.mocked(collection).mockReturnValue({} as any);

    // Mock getDocs to return empty snapshot
    const { getDocs, query, where } = await import('firebase/firestore');
    vi.mocked(getDocs).mockResolvedValue({
      docs: [],
      size: 0,
      empty: true,
    } as any);
    vi.mocked(query).mockReturnValue({} as any);
    vi.mocked(where).mockReturnValue({} as any);

    // Mock auth
    mockCurrentUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
      getIdTokenResult: vi.fn(),
    };
    
    // Update the firebase auth mock
    const { auth } = await import('@/lib/firebase');
    (auth as any).currentUser = mockCurrentUser;

    // Mock getQuestionsByDate to return empty array (no existing questions)
    const { getQuestionsByDate } = await import('@/lib/firestore');
    vi.mocked(getQuestionsByDate).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Admin Permission Required', () => {
    it('should allow upload when user has admin claim', async () => {
      // Mock user with admin claim
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      // Mock successful batch commit
      mockBatch.commit.mockResolvedValue(undefined);

      const result = await uploadDailyQuestions(mockQuestions, '2024-12-25');

      expect(result).toBe('Successfully uploaded 10 questions for 2024-12-25');
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should deny upload when user lacks admin claim', async () => {
      // Mock user without admin claim
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: false }
      });

      // Mock permission denied error
      mockBatch.commit.mockRejectedValue(new Error('permission-denied'));

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Admin access required to upload questions. Please check your permissions.');
    });

    it('should deny upload when user has no claims', async () => {
      // Mock user with no claims
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: {}
      });

      // Mock permission denied error
      mockBatch.commit.mockRejectedValue(new Error('permission-denied'));

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Admin access required to upload questions. Please check your permissions.');
    });

    it('should deny upload when user is not authenticated', async () => {
      // Mock unauthenticated user
      const { auth } = await import('@/lib/firebase');
      (auth as any).currentUser = null;

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Authentication required to access database. Please sign in.');
    });
  });

  describe('Firestore Security Rules Compliance', () => {
    it('should create documents with correct structure for questions collection', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockResolvedValue(undefined);

      await uploadDailyQuestions(mockQuestions, '2024-12-25');

      // Verify questions collection documents are created
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'questions', '2024-12-25-q0');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'questions', '2024-12-25-q1');

      // Verify batch.set is called for each question
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: '2024-12-25-q0',
          question: mockQuestions[0].question,
          choices: mockQuestions[0].choices,
          answer: mockQuestions[0].answer,
          date: '2024-12-25',
          difficulty: 1,
          lastUsed: '',
          tags: mockQuestions[0].tags
        })
      );
    });

    it('should create documents with correct structure for tags collection', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockResolvedValue(undefined);

      await uploadDailyQuestions(mockQuestions, '2024-12-25');

      // Verify tag subcollections are created
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'geography', 'questions');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'europe', 'questions');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'capitals', 'questions');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'science', 'questions');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'astronomy', 'questions');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'tags', 'planets', 'questions');
    });

    it('should use atomic batch operations for data consistency', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockResolvedValue(undefined);

      await uploadDailyQuestions(mockQuestions, '2024-12-25');

      // Verify batch operations are used
      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();

      // Verify all operations are added to batch before commit
      const setCallCount = mockBatch.set.mock.calls.length;
      expect(setCallCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling for Permission Issues', () => {
    it('should handle permission-denied error specifically', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockRejectedValue(new Error('permission-denied'));

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Admin access required to upload questions. Please check your permissions.');
    });

    it('should handle unavailable database error', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockRejectedValue(new Error('unavailable'));

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Database temporarily unavailable. Please try again.');
    });

    it('should handle generic Firebase errors', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });
      mockBatch.commit.mockRejectedValue(new Error('some-other-firebase-error'));

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('some-other-firebase-error');
    });
  });

  describe('Validation Before Upload', () => {
    it('should validate question count before attempting upload', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      // Try to upload with wrong number of questions
      await expect(
        uploadDailyQuestions([mockQuestions[0]], '2024-12-25')
      ).rejects.toThrow('Expected 10 questions, got 1');

      // Verify no batch operations were attempted
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it('should validate date format before attempting upload', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      // Try to upload with invalid date format (old MM-DD-YYYY format)
      await expect(
        uploadDailyQuestions(mockQuestions, '12-25-2024')
      ).rejects.toThrow('Date must be in YYYY-MM-DD format');

      // Verify no batch operations were attempted
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it('should check for existing questions before upload', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      // Mock existing questions for the date
      const { getQuestionsByDate } = await import('@/lib/firestore');
      vi.mocked(getQuestionsByDate).mockResolvedValue([{ id: 'existing-question' } as any]);

      await expect(
        uploadDailyQuestions(mockQuestions, '2024-12-25')
      ).rejects.toThrow('Questions already exist for 2024-12-25. Please choose a different date.');

      // Verify no batch operations were attempted
      expect(writeBatch).not.toHaveBeenCalled();
    });
  });

  describe('Question Structure Validation', () => {
    it('should validate question structure before upload', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      const invalidQuestions = [
        {
          question: "", // Empty question
          choices: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris",
          date: "2024-12-25",
          tags: ["geography", "europe", "capitals"]
        }
      ];

      await expect(
        uploadDailyQuestions(invalidQuestions, '2024-12-25')
      ).rejects.toThrow('Question 1: Question text is required');
    });

    it('should validate answer matches first choice', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      const invalidQuestions = [
        {
          question: "What is the capital of France?",
          choices: ["London", "Paris", "Berlin", "Madrid"], // Answer not first
          answer: "Paris",
          date: "2024-12-25",
          tags: ["geography", "europe", "capitals"]
        }
      ];

      await expect(
        uploadDailyQuestions(invalidQuestions, '2024-12-25')
      ).rejects.toThrow('Question 1: Answer must match the first choice');
    });

    it('should validate tag structure', async () => {
      mockCurrentUser.getIdTokenResult.mockResolvedValue({
        claims: { admin: true }
      });

      const invalidQuestions = [
        {
          question: "What is the capital of France?",
          choices: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris",
          date: "2024-12-25",
          tags: ["geography"] // Only 1 tag instead of 3
        }
      ];

      await expect(
        uploadDailyQuestions(invalidQuestions, '2024-12-25')
      ).rejects.toThrow('Question 1: Question must have exactly 3 tags (broad → subcategory → specific)');
    });
  });
}); 