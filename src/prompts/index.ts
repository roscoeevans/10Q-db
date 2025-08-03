// Prompt Management System - Main Export File

// Types
export * from './types/prompt-types';

// Configuration
export * from './config/prompt-config';

// Templates
export * from './templates/shared/formatting-rules';
export * from './templates/shared/difficulty-scaling';
export * from './templates/shared/answer-diversity';
export * from './templates/shared/factual-accuracy';
export * from './templates/shared/engagement-fun';
export * from './templates/shared/zeitgeist-culture';
export * from './templates/question-generation/base';

// Utilities
export * from './utils/prompt-builder';

// Main prompt management functions
export { buildQuestionGenerationPrompt, buildQuestionRegenerationPrompt } from './utils/prompt-builder';

// Configuration constants
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
} from './config/prompt-config';

// Template utilities
export {
  getDifficultyDescription,
  getDifficultyLevel,
  DIFFICULTY_MAPPING
} from './templates/shared/difficulty-scaling';

export {
  checkAnswerDiversity,
  getAnswerCategories,
  validateTopicDiversity
} from './templates/shared/answer-diversity';

export {
  checkFactualAccuracy,
  getFactualAccuracyGuidelines,
  validateFactualAccuracy
} from './templates/shared/factual-accuracy';

export {
  checkEngagementFun,
  getEngagementFunGuidelines,
  validateEngagementFun
} from './templates/shared/engagement-fun';

export {
  checkZeitgeistCulture,
  getZeitgeistCultureGuidelines,
  validateZeitgeistCulture
} from './templates/shared/zeitgeist-culture';

// Prompt builder utilities
export {
  buildPrompt,
  validatePromptConfig
} from './utils/prompt-builder';

// Version information
export const PROMPT_SYSTEM_VERSION = '1.0.0';
export const PROMPT_SYSTEM_DESCRIPTION = 'Modular, versioned, and optimized prompt management system for 10Q Database';

// Quick access functions for common use cases
export function createQuestionGenerationPrompt(topic: string, count: number = 10) {
  const { buildQuestionGenerationPrompt } = require('./utils/prompt-builder');
  return buildQuestionGenerationPrompt(topic, count, 'primary');
}

export function createQuestionRegenerationPrompt(
  topic: string,
  feedback: string,
  questionIndex: number,
  existingQuestions: string[]
) {
  const { buildQuestionRegenerationPrompt } = require('./utils/prompt-builder');
  return buildQuestionRegenerationPrompt(topic, feedback, questionIndex, existingQuestions, 'primary');
}

// System health check
export function getPromptSystemHealth() {
  return {
    version: PROMPT_SYSTEM_VERSION,
    status: 'healthy',
    components: {
      types: 'loaded',
      config: 'loaded',
      templates: 'loaded',
      utilities: 'loaded'
    },
    timestamp: new Date().toISOString()
  };
} 