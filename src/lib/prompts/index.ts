/**
 * Modular prompt system for question generation
 * Combines templates to create focused, high-quality prompts
 */

import { getBasePrompt } from './templates/base-prompt';
import { getDifficultyScaling } from './templates/difficulty-scaling';
import { getRegenerationPrompt } from './templates/regeneration-prompt';

/**
 * Generate the main prompt for creating a full set of questions
 */
export const generateMainPrompt = (topic: string, count: number = 10) => {
  return getBasePrompt(topic, count);
};

/**
 * Generate a prompt for regenerating a single question
 */
export const generateRegenerationPrompt = (
  topic: string,
  feedback: string,
  existingQuestions: Array<{ question: string; answer: string }>,
  questionIndex: number
) => {
  return getRegenerationPrompt(topic, feedback, existingQuestions, questionIndex);
};

/**
 * Generate a prompt for a specific difficulty level
 */
export const generateDifficultyPrompt = (topic: string, questionIndex: number) => {
  const basePrompt = getBasePrompt(topic, 1);
  const difficultyScaling = getDifficultyScaling(questionIndex);
  
  return `${basePrompt}\n\n${difficultyScaling}`;
};

/**
 * Prompt configuration for different question types
 */
export const PROMPT_CONFIG = {
  DEFAULT_MODEL: 'gemini-1.5-flash',
  MAX_RETRIES: 3,
  TEMPERATURE: 0.7, // Balanced creativity and accuracy
  MAX_TOKENS: 4000,
  
  // Quality thresholds
  MIN_QUESTION_LENGTH: 10,
  MAX_QUESTION_LENGTH: 50,
  REQUIRED_TAGS: 3,
  REQUIRED_CHOICES: 4,
  
  // Difficulty mapping
  DIFFICULTY_LEVELS: {
    EASY: [0, 1],
    INTERMEDIATE: [2, 3, 4, 5],
    ADVANCED: [6, 7],
    EXPERT: [8, 9]
  }
} as const; 