// Application configuration constants
export const APP_CONFIG = {
  NAME: '10Q Database',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered question generation and management system',
  MAX_QUESTIONS_PER_UPLOAD: 10,
  SUPPORTED_DIFFICULTIES: [1, 2, 3, 4, 5],
  DEFAULT_DIFFICULTY: 3,
  AI_MODEL: 'gpt-4',
  MAX_RETRIES: 3,
  DEBOUNCE_DELAY: 300
} as const;

// Firebase configuration
export const FIREBASE_CONFIG = {
  PROJECT_ID: 'q-production-e4848',
  COLLECTIONS: {
    QUESTIONS: 'questions',
    USERS: 'users',
    PERMISSIONS: 'permissions'
  }
} as const;

// UI configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  LOADING_TIMEOUT: 30000,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500
} as const; 