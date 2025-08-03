import type { PromptConfig, ModelConfig, SafetySettings } from '../types/prompt-types';

// Main prompt configuration
export const PROMPT_CONFIG: PromptConfig = {
  version: '1.0.0',
  maxTokens: 4000,
  temperature: 0.7,
  topP: 0.9,
  retryAttempts: 3,
  fallbackStrategies: ['simplified', 'minimal', 'legacy'],
  modelConfig: {
    primary: 'gemini-1.5-flash',
    fallback: 'gemini-1.0-pro',
    maxOutputTokens: 2000,
    safetySettings: {
      harassment: 'BLOCK_MEDIUM_AND_ABOVE',
      hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
      sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
      dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  }
} as const;

// Question generation specific configuration
export const QUESTION_GENERATION_CONFIG = {
  DEFAULT_COUNT: 10,
  MAX_QUESTIONS_PER_BATCH: 20,
  MIN_QUESTIONS_PER_BATCH: 5,
  DEFAULT_DIFFICULTY: 3,
  MAX_DIFFICULTY: 10,
  MIN_DIFFICULTY: 1,
  MAX_QUESTION_LENGTH: 200,
  MIN_QUESTION_LENGTH: 10,
  MAX_CHOICES: 6,
  MIN_CHOICES: 2,
  DEFAULT_CHOICES: 4,
  MAX_TAGS: 5,
  MIN_TAGS: 1,
  DEFAULT_TAGS: 3,
  MAX_TOPIC_LENGTH: 100,
  MIN_TOPIC_LENGTH: 3
} as const;

// Prompt template configuration
export const TEMPLATE_CONFIG = {
  MAX_TEMPLATE_LENGTH: 5000,
  MIN_TEMPLATE_LENGTH: 50,
  MAX_VARIABLES: 20,
  MAX_CONSTRAINTS: 10,
  REQUIRED_VARIABLES: ['topic', 'count'],
  RESERVED_VARIABLES: ['__version__', '__timestamp__', '__user_id__']
} as const;

// Validation configuration
export const VALIDATION_CONFIG = {
  TOKEN_LIMIT_WARNING_THRESHOLD: 0.8, // 80% of max tokens
  TOKEN_LIMIT_ERROR_THRESHOLD: 0.95, // 95% of max tokens
  RESPONSE_TIME_WARNING_THRESHOLD: 30000, // 30 seconds
  RESPONSE_TIME_ERROR_THRESHOLD: 60000, // 60 seconds
  MAX_RETRY_DELAY: 5000, // 5 seconds
  MIN_RETRY_DELAY: 1000, // 1 second
  EXPONENTIAL_BACKOFF_FACTOR: 2
} as const;

// A/B Testing configuration
export const AB_TESTING_CONFIG = {
  MIN_SAMPLE_SIZE: 100,
  CONFIDENCE_LEVEL: 0.95,
  MIN_DURATION_DAYS: 7,
  MAX_DURATION_DAYS: 30,
  DEFAULT_TRAFFIC_SPLIT: 50, // 50/50 split
  MIN_VARIANT_WEIGHT: 10, // Minimum 10% traffic per variant
  MAX_VARIANTS: 5
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  SAMPLE_RATE: 1.0, // 100% of requests
  BATCH_SIZE: 100,
  FLUSH_INTERVAL: 60000, // 1 minute
  RETENTION_DAYS: 90,
  METRICS_UPDATE_INTERVAL: 300000, // 5 minutes
  ERROR_SAMPLE_RATE: 1.0 // 100% of errors
} as const;

// Fallback strategy configuration
export const FALLBACK_CONFIG = {
  SIMPLIFIED: {
    maxTokens: 2000,
    temperature: 0.5,
    removeExamples: true,
    removeConstraints: true
  },
  MINIMAL: {
    maxTokens: 1000,
    temperature: 0.3,
    removeExamples: true,
    removeConstraints: true,
    removeFormatting: true
  },
  LEGACY: {
    maxTokens: 4000,
    temperature: 0.7,
    useOriginalPrompt: true
  }
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
  MAX_CONSECUTIVE_FAILURES: 3,
  CIRCUIT_BREAKER_THRESHOLD: 0.5, // 50% failure rate
  CIRCUIT_BREAKER_TIMEOUT: 300000, // 5 minutes
  GRACEFUL_DEGRADATION: true,
  USER_FRIENDLY_ERRORS: true
} as const;

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  SLOW_QUERY_THRESHOLD: 10000, // 10 seconds
  HIGH_TOKEN_USAGE_THRESHOLD: 0.8, // 80% of max tokens
  LOW_APPROVAL_RATE_THRESHOLD: 0.5, // 50% approval rate
  HIGH_REGENERATION_RATE_THRESHOLD: 0.3, // 30% regeneration rate
  ALERT_COOLDOWN: 300000 // 5 minutes between alerts
} as const;

// Export all configurations
export {
  PROMPT_CONFIG,
  QUESTION_GENERATION_CONFIG,
  TEMPLATE_CONFIG,
  VALIDATION_CONFIG,
  AB_TESTING_CONFIG,
  ANALYTICS_CONFIG,
  FALLBACK_CONFIG,
  ERROR_CONFIG,
  PERFORMANCE_CONFIG
}; 