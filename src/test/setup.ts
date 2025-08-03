import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    addScope: vi.fn(),
  })),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
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

// Mock Firebase config
vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

// Mock Firebase Admin
vi.mock('@/lib/firestore-admin', () => ({
  getAllQuestions: vi.fn(),
  getQuestionStatistics: vi.fn(),
}));

// Mock permissions
vi.mock('@/lib/permissions', () => ({
  permissionService: {
    checkUserPermission: vi.fn(),
  },
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}; 